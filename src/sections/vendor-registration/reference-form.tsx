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
  vendorPK: string;
  reference: any;
  onCloseForm: () => void;
  handleSavedData: (data: any) => void;
}

export function ReferenceForm({
  openForm,
  action,
  vendorPK,
  reference,
  onCloseForm,
  handleSavedData,
}: Props) {
  const schema = z.object({
    client: z.string().nonempty(_errors.required).max(255, _errors.maxLength),
    address: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[a-zA-Z0-9-#áéíóúÁÉÍÓÚ ]+$/, _errors.regex)
      .max(50, _errors.maxLength),
    contact: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ&0-9-. ]+$/, _errors.regex)
      .max(50, _errors.maxLength),
    city: z.string().nonempty(_errors.required),
    phone: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[a-zA-Z0-9- ]+$/, _errors.regex)
      .max(50, _errors.maxLength),
  });

  const defaultValues = {
    PK: '',
    client: '',
    address: '',
    contact: '',
    city: '',
    phone: '',
  };

  type FormData = z.infer<typeof schema>;

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [cityList, setCityList] = useState<any[]>([]);

  const [openDialogAdd, setOpenDialogAdd] = useState(false);
  const [lableAdd, setLabelAdd] = useState('');
  const [entityAdd, setEntityAdd] = useState('');
  const [currentAddData, setCurrentAddData] = useState<any[]>([]);

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
      setOpenDialog(true);

      const fetchData = async () => {
        const axiosRoutes = [sharedServices.getList({ entity: 'CITY' })];

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((cityRs) => {
              setCityList(cityRs.data);

              if (action === 'update') reset(reference);

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
    if (entityAdd === 'CITY') {
      setCityList((prev) => [...prev, data.data]);
      setValue(`city`, data.data.PK);
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

    data.PK = vendorPK;
    if (action === 'update') data.SK = reference.SK;

    const referenceRq =
      action === 'create'
        ? VendorService.createReference(data)
        : VendorService.updateReference(data);

    referenceRq
      .then((referenceRs) => {
        setSuccessMessage('Operación realizada con éxito');
        setIsSavingData(false);
        if (action === 'create') {
          reset(defaultValues);
        }
        handleSavedData(referenceRs.data);
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
      title={action === 'create' ? 'Crear referencia' : 'Actualizar referencia'}
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
                  name="client"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Cliente *"
                      {...field}
                      error={Boolean(errors.client)}
                      helperText={errors.client && errors.client.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Dirección *"
                      {...field}
                      error={Boolean(errors.address)}
                      helperText={errors.address && errors.address.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="contact"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Contacto *"
                      {...field}
                      error={Boolean(errors.contact)}
                      helperText={errors.contact && errors.contact.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Ciudad *"
                      {...field}
                      error={Boolean(errors.city)}
                      helperText={errors.city && errors.city.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => onOpenDialogAdd('CITY', 'ciudad', cityList)}
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
                      {cityList.map((city: any) => (
                        <MenuItem key={city.PK} value={city.PK}>
                          {city.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Teléfono *"
                      {...field}
                      error={Boolean(errors.phone)}
                      helperText={errors.phone && errors.phone.message}
                    />
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
                  {action === 'create' ? 'Crear referencia' : 'Actualizar referencia'}
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
