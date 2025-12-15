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
import IngredientService from 'src/services/ingredient-coding/ingredient-coding-service';

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
    group: z.string().nonempty(_errors.required),
    name: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/, _errors.regex)
      .max(255, _errors.maxLength),
    unit: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[a-zA-Z0-9-. ]+$/, _errors.regex)
      .max(20, _errors.maxLength),
    lossPercentage: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[0-9.]+$/, _errors.regex)
      .regex(/^([0-9]+.?[0-9]{0,2})$/, _errors.decimals)
      .refine((val) => !(Number(val) > 100), {
        message: `${_errors.max} 100`,
      })
      .refine((val) => !(Number(val) < 0), {
        message: `${_errors.min} 0`,
      }),
    usablePercentage: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[0-9.]+$/, _errors.regex)
      .regex(/^([0-9]+.?[0-9]{0,2})$/, _errors.decimals)
      .refine((val) => !(Number(val) > 100), {
        message: `${_errors.max} 100`,
      })
      .refine((val) => !(Number(val) < 0), {
        message: `${_errors.min} 0`,
      }),
    weight: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[0-9.]+$/, _errors.regex)
      .regex(/^([0-9]+.?[0-9]{0,2})$/, _errors.decimals)
      .refine((val) => !(Number(val) < 0.01), {
        message: `${_errors.min} 0.01`,
      }),
    storage: z.string().nonempty(_errors.required),
    calories: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[0-9.]+$/, _errors.regex)
      .regex(/^([0-9]+.?[0-9]{0,2})$/, _errors.decimals)
      .refine((val) => !(Number(val) < 0), {
        message: `${_errors.min} 0`,
      }),
    fileExtension: z.string().optional().or(z.literal('')),
  });

  const defaultValues = {
    group: '',
    name: '',
    unit: '',
    lossPercentage: '',
    usablePercentage: '',
    weight: '',
    storage: '',
    calories: '',
    fileExtension: '',
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

  const [fileName, setFileName] = useState<string | undefined>('');
  const [url, setUrl] = useState<string | undefined>('');
  const [file, setFile] = useState<File>();
  const [compressedFile, setCompressedFile] = useState<File>();
  const [isCompressingFile, setIsCompressingFile] = useState<boolean>(false);

  const [isSavingData, setIsSavingData] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<any>('');
  const [attachedErrorMessage, seAtttachedErrorMessage] = useState('');

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
      setUrl('');
      setFileName('');
      cleanMessages();
      setOpenDialog(true);

      const fetchData = async () => {
        const axiosRoutes = [
          sharedServices.getList({ entity: 'GROUP' }),
          sharedServices.getList({ entity: 'STORAGE' }),
        ];

        if (action === 'update') {
          axiosRoutes.push(IngredientService.getIngredient({ PK: PK, action: 'UPDATE' }));
        }

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((groupRs, storageRs, ingredientRs) => {
              setGroupList(groupRs.data);
              setStorageList(storageRs.data);

              if (action === 'update' && ingredientRs?.data) {
                const data = ingredientRs.data;

                data.lossPercentage = String(data.lossPercentage);
                data.usablePercentage = String(data.usablePercentage);
                data.weight = String(data.weight);
                data.calories = String(data.calories);

                reset(data);
                setValue('fileExtension', '');
                if (ingredientRs.data.getUrl) setUrl(ingredientRs.data.getUrl);
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

  useEffect(() => {
    if (file) {
      setIsCompressingFile(true);
      const getNewFile = async () => {
        const newFile = await compressFile(file);

        setCompressedFile(newFile);
        setFileName(newFile.name);
        setValue(`fileExtension`, newFile.name.split('.').pop());
        setUrl('');
        setTimeout(() => setIsCompressingFile(false), 1000);
      };

      getNewFile();
    }
  }, [file]);

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

  const onFileSelected = (event: any) => {
    setFile(event.target.files[0]);
  };

  const cleanMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
    seAtttachedErrorMessage('');
  };

  const afterSubmit = () => {
    if (action === 'create') {
      reset(defaultValues);
    }
    setIsSavingData(false);
  };

  const saveIngredient = async (data: any) => {
    data.lossPercentage = Number(data.lossPercentage);
    data.usablePercentage = Number(data.usablePercentage);
    data.weight = Number(data.weight);
    data.calories = Number(data.calories);

    if (!data.unit) delete data.unit;
    if (!data.fileExtension) delete data.fileExtension;
    if (action === 'update') data.PK = PK;

    const ingredientRq =
      action === 'create'
        ? IngredientService.createIngredient(data)
        : IngredientService.updateIngredient(data);

    ingredientRq
      .then((ingredientRs) => {
        if (ingredientRs.data.putUrl) {
          const fileRq = sharedServices.uploadFile(ingredientRs.data.putUrl, compressedFile!);

          fileRq
            .then((fileRs) => {
              setSuccessMessage('Operación realizada con éxito');
              afterSubmit();
            })
            .catch((fileError) => {
              seAtttachedErrorMessage(
                'El registro se guardó correctamente pero se ha presentado un error al subir el archivo'
              );
              afterSubmit();
            });
          setFileName('');
        } else {
          setSuccessMessage('Operación realizada con éxito');
          afterSubmit();
        }
        handleSavedData(ingredientRs.data);
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
      const ingredientNameRq = IngredientService.getIngredient({
        name: control._formValues.name,
      });

      ingredientNameRq
        .then((ingredientNameRs) => {
          if (ingredientNameRs.data.length > 0) {
            const message = (
              <>
                <Typography>Este ingrediente ya existe. Utilice un nombre diferente a:</Typography>
                <List
                  sx={{
                    listStyleType: 'disc',
                    pl: 2,
                    '& .MuiListItem-root': { display: 'list-item' },
                  }}
                >
                  {ingredientNameRs.data.map((element: any) => (
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
            saveIngredient(data);
          }
        })
        .catch((userError) => {
          setIsSavingData(false);
          return;
        });
    } else saveIngredient(data);
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
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Artículo *"
                      {...field}
                      error={Boolean(errors.name)}
                      helperText={errors.name && errors.name.message}
                    />
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
                      <MenuItem value="Kg.">Kg.</MenuItem>
                      <MenuItem value="L.">L.</MenuItem>
                      <MenuItem value="Unidad">Unidad</MenuItem>
                      <MenuItem value="Paquete">Paquete</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="lossPercentage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Porcentaje de merma *"
                      {...field}
                      error={Boolean(errors.lossPercentage)}
                      helperText={errors.lossPercentage && errors.lossPercentage.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="usablePercentage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Porcentaje utilizable *"
                      {...field}
                      error={Boolean(errors.usablePercentage)}
                      helperText={errors.usablePercentage && errors.usablePercentage.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="weight"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Peso neto *"
                      {...field}
                      error={Boolean(errors.weight)}
                      helperText={errors.weight && errors.weight.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="storage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Condiciones de almacenamiento *"
                      {...field}
                      error={Boolean(errors.storage)}
                      helperText={errors.storage && errors.storage.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {storageList.map((storage: any) => (
                        <MenuItem key={storage.PK} value={storage.PK}>
                          {storage.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="calories"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Calorias (Kcal) *"
                      {...field}
                      error={Boolean(errors.calories)}
                      helperText={errors.calories && errors.calories.message}
                    />
                  )}
                />
              </Grid>

              <Grid
                size={12}
                sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Typography sx={{ m: 0 }}>
                  Foto: {fileName || 'Aún no se ha subido ningún archivo.'}
                </Typography>
                <Button
                  disabled={isSavingData || isCompressingFile}
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                >
                  <Iconify icon="eva:attach-2-fill" />
                  <input
                    value=""
                    accept="image/png, image/jpeg, image/jpg"
                    hidden
                    type="file"
                    onChange={onFileSelected}
                  />
                </Button>

                {url !== '' && (
                  <Link href={url} target="_blank" sx={{ m: 0, cursor: 'pointer' }}>
                    Descargar archivo adjunto
                  </Link>
                )}
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

              {attachedErrorMessage !== '' && (
                <Grid size={12}>
                  <Alert
                    severity="warning"
                    sx={{
                      borderRadius: 1,
                      width: 1,
                      mb: 0,
                    }}
                  >
                    {attachedErrorMessage}
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
                  disabled={isCompressingFile}
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
