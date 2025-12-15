import 'dayjs/locale/es';

import { z } from 'zod';
import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FieldValues, Controller, useWatch } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import { _errors } from 'src/utils/input-errors';
import { compressFile } from 'src/utils/compress-files';

import sharedServices from 'src/services/shared/shared-services';
import ClientService from 'src/services/client-registration/client-registration-service';
import personalRegistrationService from 'src/services/personal-registration/personal-registration-service';

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
      name: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/, _errors.regex)
        .max(255, _errors.maxLength),
      documentId: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[0-9]+$/, _errors.regex)
        .max(15, _errors.maxLength),
      birthDate: z.string().optional().or(z.literal('')),
      cellphone: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[a-zA-Z0-9- ]+$/, _errors.regex)
        .max(50, _errors.maxLength),
      phone: z
        .string()
        .regex(/^[a-zA-Z0-9- ]+$/, _errors.regex)
        .max(50, _errors.maxLength)
        .optional()
        .or(z.literal('')),
      address: z
        .string()
        .regex(/^[a-zA-Z0-9-#áéíóúÁÉÍÓÚ ]+$/, _errors.regex)
        .max(255, _errors.maxLength)
        .optional()
        .or(z.literal('')),
      position: z.string().nonempty(_errors.required),
      email: z.string().nonempty(_errors.required).email(_errors.email).max(100, _errors.maxLength),
      username: z
        .string()
        .regex(/^[a-z0-9]+$/, _errors.regex)
        .min(6, _errors.minLength)
        .max(14, _errors.maxLength)
        .optional()
        .or(z.literal('')),
      password: z
        .string()
        .regex(/[A-Z]/, _errors.oneUpperCase)
        .regex(/[a-z]/, _errors.oneLowerCase)
        .regex(/[0-9]/, _errors.oneNumber)
        .regex(/[^a-zA-Z0-9]/, _errors.oneSpecialCharacter)
        .min(8, _errors.minLength)
        .max(14, _errors.maxLength)
        .optional()
        .or(z.literal('')),
      profile: z.string().optional().or(z.literal('')),
      status: z.string().optional().or(z.literal('')),
      enterprises: z.array(z.string()).optional(),
      fileExtension: z.string().optional().or(z.literal('')),
    })
    .superRefine((data, ctx) => {
      if (isThereUser && !data.username) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: _errors.required,
          path: ['username'],
        });
      }

      if (isThereUser && !userExists && !data.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: _errors.required,
          path: ['password'],
        });
      }

      if (isThereUser && !data.profile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: _errors.required,
          path: ['profile'],
        });
      }

      if (isThereUser && !data.status) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: _errors.required,
          path: ['status'],
        });
      }
    });

  const defaultValues = {
    name: '',
    documentId: '',
    birthDate: '',
    cellphone: '',
    phone: '',
    address: '',
    position: '',
    email: '',
    username: '',
    password: '',
    profile: '',
    status: '',
    enterprises: [],
    fileExtension: '',
  };

  type FormData = z.infer<typeof schema>;

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [positionList, setPositionList] = useState<any[]>([]);
  const [profileList, setProfileList] = useState<any[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);

  const [openDialogAdd, setOpenDialogAdd] = useState(false);
  const [lableAdd, setLabelAdd] = useState('');
  const [entityAdd, setEntityAdd] = useState('');
  const [currentAddData, setCurrentAddData] = useState<any[]>([]);

  const [isThereUser, setIsThereUser] = useState(false);
  const [userExists, setUserExists] = useState(false);

  const [fileName, setFileName] = useState<string | undefined>('');
  const [url, setUrl] = useState<string | undefined>('');
  const [file, setFile] = useState<File>();
  const [compressedFile, setCompressedFile] = useState<File>();
  const [isCompressingFile, setIsCompressingFile] = useState<boolean>(false);

  const [isSavingData, setIsSavingData] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [attachedErrorMessage, seAtttachedErrorMessage] = useState('');

  const {
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
    disabled: isSavingData,
    mode: 'onChange',
  });

  const profileValue = useWatch({ control, name: 'profile' });

  useEffect(() => {
    if (openForm) {
      setIsLoading(true);
      setGlobalError(false);

      reset(defaultValues);
      setUrl('');
      setFileName('');
      cleanMessages();
      setIsThereUser(false);
      setUserExists(false);
      setOpenDialog(true);

      const fetchData = async () => {
        const axiosRoutes = [
          sharedServices.getList({ entity: 'POSITION' }),
          sharedServices.getList({ entity: 'PROFILE' }),
          ClientService.getClient({ all: 'ALL' }),
        ];

        if (action === 'update') {
          axiosRoutes.push(personalRegistrationService.getUser({ PK: PK, action: 'UPDATE' }));
        }

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((positionRs, profileRs, clientRs, userRs) => {
              setPositionList(positionRs.data);
              setProfileList(profileRs.data.filter((item: any) => item.type === 'System'));
              setClientsList(clientRs.data);

              if (action === 'update' && userRs?.data) {
                reset(userRs.data);
                setValue('fileExtension', '');
                if (userRs.data.getUrl) setUrl(userRs.data.getUrl);

                if (userRs.data.username) {
                  setUserExists(true);
                  setIsThereUser(true);
                } else {
                  setValue('profile', '');
                  setValue('status', '');
                }
                setValue('password', '');
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
        const newFile = await compressFile(file, 'auto');

        setCompressedFile(newFile);
        setFileName(newFile.name);
        setValue(`fileExtension`, newFile.name.split('.').pop());
        setUrl('');
        setTimeout(() => setIsCompressingFile(false), 1000);
      };

      getNewFile();
    }
  }, [file]);

  useEffect(() => {
    if (isThereUser) {
      setValue('status', 'ACTIVE');
    } else {
      clearErrors(['username', 'password', 'profile', 'status']);
      setValue('username', '');
      setValue('password', '');
      setValue('profile', '');
      setValue('status', '');
      setValue('enterprises', []);
    }
  }, [isThereUser]);

  useEffect(() => {
    if (profileValue !== 'PROFILE2') setValue('enterprises', []);
  }, [profileValue]);

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
    if (entityAdd === 'POSITION') {
      setPositionList((prev) => [...prev, data.data]);
      setValue(`position`, data.data.PK);
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
    setIsSavingData(false);
    if (action === 'create') {
      reset(defaultValues);
      setValue('birthDate', '');
    }
  };

  const onSubmit = async (data: FieldValues) => {
    setIsSavingData(true);
    cleanMessages();

    if (!data.birthDate) delete data.birthDate;
    if (!data.phone) delete data.phone;
    if (!data.address) delete data.address;
    if (!data.username) delete data.username;
    if (!data.password) delete data.password;
    if (!data.profile) delete data.profile;
    if (!data.status) delete data.status;
    if (!data.fileExtension) delete data.fileExtension;
    if (action === 'update') data.PK = PK;

    const userRq =
      action === 'create'
        ? personalRegistrationService.createUser(data)
        : personalRegistrationService.updateUser(data);

    userRq
      .then((userRs) => {
        if (userRs.data.putUrl) {
          const fileRq = sharedServices.uploadFile(userRs.data.putUrl, compressedFile!);

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
        handleSavedData(userRs.data);
      })
      .catch((userError) => {
        if (userError.response) setErrorMessage(userError.response.data);
        else setErrorMessage('Se ha presentado un error. Intente nuevamente');
        setIsSavingData(false);
      });
  };

  return (
    <ModalDialog
      isOpen={openDialog}
      handleClose={handleDialogClose}
      title={action === 'create' ? 'Crear usuario' : 'Actualizar usuario'}
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
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="documentId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Cédula *"
                      {...field}
                      error={Boolean(errors.documentId)}
                      helperText={errors.documentId && errors.documentId.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                      <DatePicker
                        disabled={isSavingData}
                        label="Fecha de nacimiento"
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        value={value ? dayjs(value) : null}
                        onChange={(newValue) => {
                          onChange(newValue ? newValue.toISOString() : null);
                        }}
                        {...rest}
                      />
                    </LocalizationProvider>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="cellphone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Celular *"
                      {...field}
                      error={Boolean(errors.cellphone)}
                      helperText={errors.cellphone && errors.cellphone.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Teléfono"
                      {...field}
                      error={Boolean(errors.phone)}
                      helperText={errors.phone && errors.phone.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Dirección"
                      {...field}
                      error={Boolean(errors.address)}
                      helperText={errors.address && errors.address.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="position"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Cargo *"
                      {...field}
                      error={Boolean(errors.position)}
                      helperText={errors.position && errors.position.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => onOpenDialogAdd('POSITION', 'cargo', positionList)}
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
                      {positionList.map((position: any) => (
                        <MenuItem key={position.PK} value={position.PK}>
                          {position.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Email *"
                      {...field}
                      error={Boolean(errors.email)}
                      helperText={errors.email && errors.email.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={action === 'update' && userExists}
                      checked={isThereUser}
                      onChange={(event) => setIsThereUser(event.target.checked)}
                    />
                  }
                  label="Crear usuario y contraseña"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={!isThereUser || (action === 'update' && userExists)}
                      fullWidth
                      size="small"
                      label={'Usuario' + (isThereUser ? ' *' : '')}
                      autoComplete="off"
                      inputProps={{ autoComplete: 'new-username' }}
                      {...field}
                      error={Boolean(errors.username)}
                      helperText={errors.username && errors.username.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={!isThereUser}
                      type="password"
                      fullWidth
                      size="small"
                      label={'Contraseña' + (isThereUser && !userExists ? ' *' : '')}
                      autoComplete="off"
                      inputProps={{ autoComplete: 'new-password' }}
                      {...field}
                      error={Boolean(errors.password)}
                      helperText={errors.password && errors.password.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="profile"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={!isThereUser}
                      select
                      fullWidth
                      size="small"
                      label={'Perfil' + (isThereUser ? ' *' : '')}
                      {...field}
                      error={Boolean(errors.profile)}
                      helperText={errors.profile && errors.profile.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {profileList.map((profile: any) => (
                        <MenuItem key={profile.PK} value={profile.PK}>
                          {profile.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={action === 'create' || !isThereUser}
                      select
                      fullWidth
                      size="small"
                      label={'Estado' + (isThereUser ? ' *' : '')}
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

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="enterprises"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={profileValue !== 'PROFILE2'}
                      select
                      fullWidth
                      size="small"
                      label="Empresas"
                      value={field.value || []}
                      onChange={(e) => field.onChange(e.target.value)}
                      SelectProps={{
                        multiple: true,
                        renderValue: (selected: any): React.ReactNode => {
                          const selectedArray = Array.isArray(selected) ? selected : [selected];
                          const names = selectedArray
                            .map((clientPK) => {
                              const client = clientsList.find(
                                (enterprise: any) => enterprise.PK === clientPK
                              );
                              return client ? client.name : String(clientPK);
                            })
                            .filter(Boolean);
                          return names.join(', ');
                        },
                      }}
                      error={Boolean(errors.enterprises)}
                      helperText={errors.enterprises && (errors.enterprises as any).message}
                    >
                      {clientsList.map((client: any) => (
                        <MenuItem key={client.PK} value={client.PK}>
                          <Checkbox checked={(field.value || []).indexOf(client.PK) > -1} />
                          {client.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid
                size={12}
                sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Typography sx={{ m: 0 }}>
                  Firma: {fileName || 'Aún no se ha subido ningún archivo.'}
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
                  {action === 'create' ? 'Crear usuario' : 'Actualizar usuario'}
                </Button>
              </Grid>
            </Grid>
          </form>

          {openDialogAdd && (
            <AddList
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
