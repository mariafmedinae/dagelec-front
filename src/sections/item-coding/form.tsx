import { z } from 'zod';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FieldValues, Controller } from 'react-hook-form';

import {
  Alert,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import { _errors } from 'src/utils/input-errors';
import { compressFile } from 'src/utils/compress-files';

import sharedServices from 'src/services/shared/shared-services';
import ItemService from 'src/services/item-coding/item-coding-service';

import { Iconify } from 'src/components/iconify';
import { Loading } from 'src/components/loading';
import { AddList } from 'src/components/add-list';
import { ModalDialog } from 'src/components/modal-dialog';

// ----------------------------------------------------------------------

interface Props {
  openForm: boolean;
  action: string;
  PK?: string;
  onCloseForm: () => void;
  handleSavedData: (data: any) => void;
}

export function Form({ openForm, action, PK, onCloseForm, handleSavedData }: Props) {
  const schema = z.object({
    reference: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[a-zA-Z0-9]+$/, _errors.regex)
      .max(20, _errors.maxLength),
    category: z.string().optional().or(z.literal('')),
    group: z.string().nonempty(_errors.required),
    subgroup: z.string().optional().or(z.literal('')),
    name: z.string().nonempty(_errors.required).max(20, _errors.maxLength),
    longName: z.string().max(255, _errors.maxLength).optional().or(z.literal('')),
    iva: z.string().nonempty(_errors.required),
    unit: z.string().nonempty(_errors.required),
    status: z.string().nonempty(_errors.required),
  });

  const defaultValues = {
    reference: '',
    category: '',
    group: '',
    subgroup: '',
    name: '',
    longName: '',
    iva: '',
    unit: '',
    status: '',
  };

  type FormData = z.infer<typeof schema>;

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [groupList, setGroupList] = useState<any[]>([]);
  const [storageList, setStorageList] = useState<any[]>([]);

  const [openDialogAdd, setOpenDialogAdd] = useState(false);
  const [lableAdd, setLabelAdd] = useState('');
  const [entityAdd, setEntityAdd] = useState('');
  const [currentAddData, setCurrentAddData] = useState<any[]>([]);

  const [isSavingData, setIsSavingData] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<any>('');

  const {
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
    disabled: isSavingData,
    mode: 'onChange',
  });

  useEffect(() => {
    if (openForm) {
      setIsLoading(true);
      setGlobalError(false);

      reset(defaultValues);
      cleanMessages();
      setOpenDialog(true);

      const fetchData = async () => {
        const axiosRoutes = [
          sharedServices.getList({ entity: 'GROUP' }),
          sharedServices.getList({ entity: 'STORAGE' }),
        ];

        if (action === 'update') {
          axiosRoutes.push(ItemService.getItem({ PK: PK, action: 'UPDATE' }));
        }

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((groupRs, storageRs, itemRs) => {
              setGroupList(groupRs.data);
              setStorageList(storageRs.data);

              if (action === 'update' && itemRs?.data) {
                const data = itemRs.data;
                reset(data);
              }

              setIsLoading(false);
              setGlobalError(false);
            })
          )
          .catch((error) => {
            setIsLoading(false);
            setGlobalError(true);
          });
      };

      fetchData();
    }
  }, [openForm]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    onCloseForm();
  };

  const onOpenDialogAdd = (entity: string, label: string, data: any) => {
    setLabelAdd(label);
    setEntityAdd(entity);
    setCurrentAddData(() => data);

    setOpenDialogAdd(true);
  };

  const setInputAddData = (data: any) => {
    if (entityAdd === 'GROUP') {
      setGroupList((prev) => [...prev, data.data]);
      setValue(`group`, data.data.PK);
    }
  };

  const cleanMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const afterSubmit = () => {
    if (action === 'create') {
      reset(defaultValues);
    }
    setIsSavingData(false);
  };

  const saveItem = async (data: any) => {
    if (!data.unit) delete data.unit;
    if (!data.fileExtension) delete data.fileExtension;
    if (action === 'update') data.PK = PK;

    const itemRq =
      action === 'create' ? ItemService.createItem(data) : ItemService.updateItem(data);

    itemRq
      .then((itemRs) => {
        setSuccessMessage('Operación realizada con éxito');
        afterSubmit();
        handleSavedData(itemRs.data);
      })
      .catch((userError) => {
        if (userError.response) setErrorMessage(userError.response.data);
        else setErrorMessage('Se ha presentado un error. Intente nuevamente');
        setIsSavingData(false);
      });
  };

  const onSubmit = async (data: FieldValues) => {
    setIsSavingData(true);
    cleanMessages();

    if (action === 'create') {
      const itemNameRq = ItemService.getItem({
        name: control._formValues.name,
      });

      itemNameRq
        .then((itemNameRs) => {
          if (itemNameRs.data.length > 0) {
            const message = (
              <>
                <Typography>Este iteme ya existe. Utilice un nombre diferente a:</Typography>
                <List
                  sx={{
                    listStyleType: 'disc',
                    pl: 2,
                    '& .MuiListItem-root': { display: 'list-item' },
                  }}
                >
                  {itemNameRs.data.map((element: any) => (
                    <ListItem disablePadding key={element.PK}>
                      <ListItemText primary={element.name} />
                    </ListItem>
                  ))}
                </List>
              </>
            );
            setErrorMessage(message);
            setIsSavingData(false);
            return;
          } else {
            saveItem(data);
          }
        })
        .catch((userError) => {
          setIsSavingData(false);
          return;
        });
    } else saveItem(data);
  };

  return (
    <ModalDialog
      isOpen={openDialog}
      handleClose={handleDialogClose}
      title={action === 'create' ? 'Crear producto' : 'Actualizar producto'}
    >
      {isLoading && <Loading />}

      {globalError && (
        <Alert
          severity="error"
          sx={{
            borderRadius: 1,
            width: 1,
            mb: 0,
          }}
        >
          Se ha presentado un error. Intente nuevamente
        </Alert>
      )}

      {!isLoading && !globalError && (
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="reference"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Referencia *"
                      {...field}
                      error={Boolean(errors.reference)}
                      helperText={errors.reference && errors.reference.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Categoría"
                      {...field}
                      error={Boolean(errors.category)}
                      helperText={errors.category && errors.category.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {groupList.map((group: any) => (
                        <MenuItem key={group.PK} value={group.PK}>
                          {group.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="group"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Grupo *"
                      {...field}
                      error={Boolean(errors.group)}
                      helperText={errors.group && errors.group.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => onOpenDialogAdd('GROUP', 'grupo', groupList)}
                                edge="end"
                              >
                                <Iconify icon="mingcute:add-line" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{
                        '& .MuiSvgIcon-root': {
                          position: 'absolute',
                          right: '35px',
                        },
                      }}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {groupList.map((group: any) => (
                        <MenuItem key={group.PK} value={group.PK}>
                          {group.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="subgroup"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Subgrupo"
                      {...field}
                      error={Boolean(errors.subgroup)}
                      helperText={errors.subgroup && errors.subgroup.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => onOpenDialogAdd('GROUP', 'grupo', groupList)}
                                edge="end"
                              >
                                <Iconify icon="mingcute:add-line" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{
                        '& .MuiSvgIcon-root': {
                          position: 'absolute',
                          right: '35px',
                        },
                      }}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {groupList.map((group: any) => (
                        <MenuItem key={group.PK} value={group.PK}>
                          {group.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Nombre *"
                      {...field}
                      error={Boolean(errors.name)}
                      helperText={errors.name && errors.name.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="longName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Nombre largo *"
                      {...field}
                      error={Boolean(errors.longName)}
                      helperText={errors.longName && errors.longName.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="iva"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Iva *"
                      {...field}
                      error={Boolean(errors.iva)}
                      helperText={errors.iva && errors.iva.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="19%">19%</MenuItem>
                      <MenuItem value="5%">5%</MenuItem>
                      <MenuItem value="No gravado">No gravado</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Unidad de medida *"
                      {...field}
                      error={Boolean(errors.unit)}
                      helperText={errors.unit && errors.unit.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="Unidad">Unidad</MenuItem>
                      <MenuItem value="Paquete">Paquete</MenuItem>
                      <MenuItem value="Par">Par</MenuItem>
                      <MenuItem value="Botella">Botella</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Estado *"
                      {...field}
                      error={Boolean(errors.status)}
                      helperText={errors.status && errors.status.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="ACTIVE">Activo</MenuItem>
                      <MenuItem value="INACTIVE">Inactivo</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              {errorMessage !== '' && (
                <Grid size={12}>
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 1,
                      width: 1,
                      mb: 0,
                    }}
                  >
                    {errorMessage}
                  </Alert>
                </Grid>
              )}

              {successMessage !== '' && (
                <Grid size={12}>
                  <Alert
                    severity="success"
                    sx={{
                      borderRadius: 1,
                      width: 1,
                      mb: 0,
                    }}
                  >
                    {successMessage}
                  </Alert>
                </Grid>
              )}

              <Grid size={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="inherit"
                  loading={isSavingData}
                  loadingPosition="start"
                  fullWidth
                >
                  {action === 'create' ? 'Crear producto' : 'Actualizar producto'}
                </Button>
              </Grid>
            </Grid>
          </form>

          {openDialogAdd && (
            <AddList
              includesCode
              openDialog={openDialogAdd}
              label={lableAdd}
              entity={entityAdd}
              currentData={currentAddData}
              onCloseDialogAdd={() => setOpenDialogAdd(false)}
              onDataSend={(data) => setInputAddData(data)}
            />
          )}
        </>
      )}
    </ModalDialog>
  );
}
