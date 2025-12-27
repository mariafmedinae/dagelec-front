import { z } from 'zod';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FieldValues, Controller } from 'react-hook-form';

import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
} from '@mui/material';

import { _errors } from 'src/utils/input-errors';

import sharedServices from 'src/services/shared/shared-services';
import VendorService from 'src/services/vendor-registration/vendor-registration-service';

import { Iconify } from 'src/components/iconify';
import { Loading } from 'src/components/loading';
import { AddList } from 'src/components/add-list';
import { ModalDialog } from 'src/components/modal-dialog';

// ----------------------------------------------------------------------

interface Props {
  openForm: boolean;
  action: string;
  enterprisePK: string;
  contact: any;
  onCloseForm: () => void;
  handleSavedData: (data: any) => void;
}

export function ContactForm({
  openForm,
  action,
  enterprisePK,
  contact,
  onCloseForm,
  handleSavedData,
}: Props) {
  const schema = z
    .object({
      name: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/, _errors.regex)
        .max(255, _errors.maxLength),
      cellphone: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[a-zA-Z0-9- ]+$/, _errors.regex)
        .max(50, _errors.maxLength),
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
    PK: '',
    name: '',
    position: '',
    cellphone: '',
    email: '',
    username: '',
    password: '',
    profile: '',
    status: '',
  };

  type FormData = z.infer<typeof schema>;

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [positionList, setPositionList] = useState<any[]>([]);
  const [profileList, setProfileList] = useState<any[]>([]);

  const [openDialogAdd, setOpenDialogAdd] = useState(false);
  const [lableAdd, setLabelAdd] = useState('');
  const [entityAdd, setEntityAdd] = useState('');
  const [currentAddData, setCurrentAddData] = useState<any[]>([]);

  const [isThereUser, setIsThereUser] = useState(false);
  const [userExists, setUserExists] = useState(false);

  const [isSavingData, setIsSavingData] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  useEffect(() => {
    if (openForm) {
      setIsLoading(true);
      setGlobalError(false);

      reset(defaultValues);
      cleanMessages();
      setIsThereUser(false);
      setUserExists(false);
      setOpenDialog(true);

      const fetchData = async () => {
        const axiosRoutes = [
          sharedServices.getList({ entity: 'POSITION' }),
          sharedServices.getList({ entity: 'PROFILE' }),
        ];

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((positionRs, profileRs, dishRs) => {
              setPositionList(positionRs.data);
              setProfileList(profileRs.data.filter((item: any) => item.type === 'Client'));

              if (action === 'update') {
                reset(contact);

                if (contact.username) {
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
    if (isThereUser) {
      setValue('status', 'ACTIVE');
    } else {
      clearErrors(['username', 'password', 'profile', 'status']);
      setValue('username', '');
      setValue('password', '');
      setValue('profile', '');
      setValue('status', '');
    }
  }, [isThereUser]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    onCloseForm();
    reset();
    setSuccessMessage('');
    setErrorMessage('');
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

  const cleanMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const onSubmit = async (data: FieldValues) => {
    setIsSavingData(true);
    setSuccessMessage('');
    setErrorMessage('');

    data.PK = enterprisePK;
    if (!data.username) delete data.username;
    if (!data.password) delete data.password;
    if (!data.profile) delete data.profile;
    if (!data.status) delete data.status;
    if (action === 'update') data.SK = contact.SK;

    const clientRq =
      action === 'create' ? VendorService.createContact(data) : VendorService.updateContact(data);

    clientRq
      .then((clientRs) => {
        setSuccessMessage('Operación realizada con éxito');
        setIsSavingData(false);
        if (action === 'create') {
          reset(defaultValues);
        }
        handleSavedData(clientRs.data);
      })
      .catch((clientError) => {
        if (clientError.response) setErrorMessage(clientError.response.data);
        else setErrorMessage('Se ha presentado un error. Intente nuevamente');
        setIsSavingData(false);
      });
  };

  return (
    <ModalDialog
      isOpen={openDialog}
      handleClose={handleDialogClose}
      title={action === 'create' ? 'Crear contacto' : 'Actualizar contacto'}
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

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
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

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
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

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
                  {action === 'create' ? 'Crear contacto' : 'Actualizar contacto'}
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
