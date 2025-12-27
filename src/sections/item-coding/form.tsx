import { z } from 'zod';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FieldValues, Controller } from 'react-hook-form';

import {
  Alert,
  Autocomplete,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import { _errors } from 'src/utils/input-errors';

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
  const schema = z
    .object({
      reference: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[a-zA-Z0-9]+$/, _errors.regex)
        .max(7, _errors.maxLength),
      category: z.string().nonempty(_errors.required),
      group: z.string().nonempty(_errors.required),
      subgroup: z.string().nonempty(_errors.required),
      name: z.string().nonempty(_errors.required).max(20, _errors.maxLength),
      longName: z.string().max(255, _errors.maxLength).optional().or(z.literal('')),
      iva: z.string().nonempty(_errors.required),
      unit: z.string().nonempty(_errors.required),
      status: z.string().nonempty(_errors.required),
    })
    .superRefine((data, ctx) => {
      if (!isValidName && data.name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ingrese un nombre que no exista',
          path: ['name'],
        });
      }

      if (!isValidReference && data.reference) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Ingrese una referencia que no exista',
          path: ['reference'],
        });
      }
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
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [groupList, setGroupList] = useState<any[]>([]);
  const [subgroupList, setSubgroupList] = useState<any[]>([]);

  const [isValidName, setIsValidName] = useState(true);
  const [isValidReference, setIsValidReference] = useState(true);

  const [openDialogAdd, setOpenDialogAdd] = useState(false);
  const [lableAdd, setLabelAdd] = useState('');
  const [entityAdd, setEntityAdd] = useState('');
  const [parentAdd, setParentAdd] = useState('');
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
        const axiosRoutes = [];

        if (action === 'update')
          axiosRoutes.push(ItemService.getItem({ PK: PK, action: 'UPDATE' }));
        else axiosRoutes.push(sharedServices.getList({ entity: 'CATEGORY' }));

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((res) => {
              if (action === 'update' && res?.data) {
                const data = res.data;

                setCategoryList([{ PK: res.data.category, name: res.data.categoryName }]);
                setGroupList([{ PK: res.data.group, name: res.data.groupName }]);
                setSubgroupList([{ PK: res.data.subgroup, name: res.data.subgroupName }]);

                reset(data);
              } else {
                setCategoryList(res.data);
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

  const getGroupList = async (categoryPK: string) => {
    setValue('group', '');
    setValue('subgroup', '');

    if (categoryPK !== '') {
      const categoryRq = sharedServices.getList({
        parent: categoryPK,
        entity: 'GROUP',
      });

      categoryRq
        .then((res) => {
          setGroupList(res.data);
        })
        .catch((error) => {
          setValue('category', '');
          setErrorMessage(
            'Hubo un error al cargar los grupos. Seleccione la categoría para intentar nuevamente.'
          );
        });
    }
  };

  const getSubgroupList = async (groupPK: string) => {
    setValue('subgroup', '');

    if (groupPK !== '') {
      const groupRq = sharedServices.getList({
        parent: groupPK,
        entity: 'SUBGROUP',
      });

      groupRq
        .then((res) => {
          setSubgroupList(res.data);
        })
        .catch((error) => {
          setValue('group', '');
          setErrorMessage(
            'Hubo un error al cargar los subgrupos. Seleccione el grupo para intentar nuevamente.'
          );
        });
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    onCloseForm();
  };

  const onOpenDialogAdd = (entity: string, label: string, parent: string, data: any) => {
    setLabelAdd(label);
    setEntityAdd(entity);
    setParentAdd(parent);
    setCurrentAddData(() => data);

    setOpenDialogAdd(true);
  };

  const setInputAddData = (data: any) => {
    if (entityAdd === 'GROUP') {
      setGroupList((prev) => [...prev, data.data]);
      setValue(`group`, data.data.PK);
    } else if (entityAdd === 'SUBGROUP') {
      setSubgroupList((prev) => [...prev, data.data]);
      setValue(`subgroup`, data.data.PK);
    }
  };

  const verifyName = async () => {
    cleanMessages();

    const itemRq = ItemService.getItem({
      name: control._formValues.name,
    });

    itemRq
      .then((itemRs) => {
        if (itemRs.data.length > 0) {
          setIsValidName(false);
          setErrorMessage('Este item ya existe. Utilice un nombre diferente.');
          return;
        }
      })
      .catch((error) => {
        setIsValidName(true);
      });
  };

  const verifyReference = async () => {
    cleanMessages();

    const itemRq = ItemService.getItem({
      reference: control._formValues.reference,
    });

    itemRq
      .then((itemRs) => {
        if (itemRs.data.length > 0) {
          setIsValidReference(false);
          setErrorMessage(
            `Esta referencia ya existe y está siendo utilizada por el item: ${itemRs.data[0].name}. Utilice una referencia diferente.`
          );
          return;
        }
      })
      .catch((error) => {
        setIsValidReference(true);
      });
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

  const onSubmit = async (data: FieldValues) => {
    setIsSavingData(true);
    cleanMessages();

    if (!data.longName) delete data.longName;
    if (action === 'update') {
      data.PK = PK;
      delete data.reference;
      delete data.category;
      delete data.group;
      delete data.subgroup;
    }

    const itemRq =
      action === 'create' ? ItemService.createItem(data) : ItemService.updateItem(data);

    itemRq
      .then((itemRs) => {
        setSuccessMessage('Operación realizada con éxito');
        afterSubmit();
        handleSavedData(itemRs.data);
      })
      .catch((error) => {
        if (error.response) setErrorMessage(error.response.data);
        else setErrorMessage('Se ha presentado un error. Intente nuevamente');
        setIsSavingData(false);
      });
  };

  return (
    <ModalDialog
      isOpen={openDialog}
      handleClose={handleDialogClose}
      title={action === 'create' ? 'Crear producto o servicio' : 'Actualizar producto o servicio'}
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
                      disabled={action === 'update'}
                      fullWidth
                      size="small"
                      label="Referencia *"
                      {...field}
                      error={Boolean(errors.reference)}
                      helperText={errors.reference && errors.reference.message}
                      onBlur={verifyReference}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={action === 'update'}
                      select
                      fullWidth
                      size="small"
                      label="Categoría *"
                      {...field}
                      error={Boolean(errors.category)}
                      helperText={errors.category && errors.category.message}
                      onChange={(e) => {
                        field.onChange(e);
                        setErrorMessage('');
                        getGroupList(e.target.value);
                      }}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {categoryList.map((category: any) => (
                        <MenuItem key={category.PK} value={category.PK}>
                          {category.name}
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
                  render={({ field }) => {
                    const selected = groupList.find((item) => item.PK === field.value) || '';

                    return (
                      <Autocomplete
                        disabled={action === 'update'}
                        size="small"
                        {...field}
                        options={groupList}
                        noOptionsText="No hay resultados"
                        getOptionLabel={(option) => option.name || ''}
                        isOptionEqualToValue={(option, value) => option.PK === value.PK}
                        value={selected}
                        onChange={(event, newValue) => {
                          const value = newValue ? newValue.PK : '';
                          field.onChange(value);
                          setErrorMessage('');
                          if (newValue) {
                            getSubgroupList(value);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Grupo *"
                            error={Boolean(errors.group)}
                            helperText={errors.group && errors.group.message}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: action === 'create' && (
                                <>
                                  <InputAdornment position="start">
                                    <IconButton
                                      onClick={() =>
                                        onOpenDialogAdd(
                                          'GROUP',
                                          'grupo',
                                          control._formValues.category,
                                          groupList
                                        )
                                      }
                                      edge="end"
                                    >
                                      <Iconify icon="mingcute:add-line" />
                                    </IconButton>
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    );
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="subgroup"
                  control={control}
                  render={({ field }) => {
                    const selected = subgroupList.find((item) => item.PK === field.value) || '';

                    return (
                      <Autocomplete
                        disabled={action === 'update'}
                        size="small"
                        {...field}
                        options={subgroupList}
                        noOptionsText="No hay resultados"
                        getOptionLabel={(option) => option.name || ''}
                        isOptionEqualToValue={(option, value) => option.PK === value.PK}
                        value={selected}
                        onChange={(event, newValue) => {
                          field.onChange(newValue ? newValue.PK : '');
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Subgrupo *"
                            error={Boolean(errors.subgroup)}
                            helperText={errors.subgroup && errors.subgroup.message}
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: action === 'create' && (
                                <>
                                  <InputAdornment position="start">
                                    <IconButton
                                      onClick={() =>
                                        onOpenDialogAdd(
                                          'SUBGROUP',
                                          'subgrupo',
                                          control._formValues.group,
                                          subgroupList
                                        )
                                      }
                                      edge="end"
                                    >
                                      <Iconify icon="mingcute:add-line" />
                                    </IconButton>
                                  </InputAdornment>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    );
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={action === 'update'}
                      fullWidth
                      size="small"
                      label="Nombre *"
                      {...field}
                      error={Boolean(errors.name)}
                      helperText={errors.name && errors.name.message}
                      onBlur={verifyName}
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
                      label="Nombre largo"
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
                      label="IVA *"
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

              <Grid size={{ xs: 12, md: 4 }}>
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
                      <MenuItem value="Activo">Activo</MenuItem>
                      <MenuItem value="Inactivo">Inactivo</MenuItem>
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
                  {action === 'create'
                    ? 'Crear producto o servicio'
                    : 'Actualizar producto o servicio'}
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
              parent={parentAdd}
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
