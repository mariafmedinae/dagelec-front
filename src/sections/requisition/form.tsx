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
  MenuItem,
  TextField,
} from '@mui/material';

import { _errors } from 'src/utils/input-errors';

import sharedServices from 'src/services/shared/shared-services';
import RequisitionService from 'src/services/requisition/requisition-service';
import PersonalService from 'src/services/personal-registration/personal-registration-service';

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
    city: z.string().nonempty(_errors.required),
    proccess: z.string().nonempty(_errors.required),
    deliveryPlace: z.string().nonempty(_errors.required).max(255, _errors.maxLength),
    costCenter: z.string().nonempty(_errors.required),
    observations: z.string().max(1020, _errors.maxLength).optional().or(z.literal('')),
    checker1: z.string().nonempty(_errors.required),
    checker2: z.string().optional().or(z.literal('')),
    approver: z.string().nonempty(_errors.required),
  });

  const defaultValues = {
    city: '',
    proccess: '',
    deliveryPlace: '',
    costCenter: '',
    observations: '',
    checker1: '',
    checker2: '',
    approver: '',
  };

  type FormData = z.infer<typeof schema>;

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [cityList, setCityList] = useState<any[]>([]);
  const [proccessList, setProccessList] = useState<any[]>([]);
  const [costCenterList, setCostCenterList] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);

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
          sharedServices.getList({ entity: 'CITY' }),
          sharedServices.getList({ entity: 'PROCCESS' }),
          sharedServices.getList({ entity: 'COST' }),
          PersonalService.getUser({ all: 'ALL' }),
        ];

        if (action === 'update')
          axiosRoutes.push(
            RequisitionService.getRequisition({ PK: PK, action: 'UPDATE', type: 'U' })
          );

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((cityRs, proccessRs, costCenterRs, userRs, resquisitionRs) => {
              setCityList(cityRs.data);
              setProccessList(proccessRs.data);
              setCostCenterList(costCenterRs.data);
              setUserList(userRs.data);

              if (action === 'update' && resquisitionRs?.data) {
                const data = resquisitionRs.data;

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
    if (entityAdd === 'CITY') {
      setCityList((prev) => [...prev, data.data]);
      setValue(`city`, data.data.PK);
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

  const onSubmit = async (data: FieldValues) => {
    setIsSavingData(true);
    cleanMessages();

    if (!data.observations) delete data.observations;
    if (action === 'update') {
      data.PK = PK;
    }

    const requisitionRq =
      action === 'create'
        ? RequisitionService.createRequisition(data)
        : RequisitionService.updateRequisition(data);

    requisitionRq
      .then((requisitionRs) => {
        setSuccessMessage('Operación realizada con éxito');
        afterSubmit();
        handleSavedData(requisitionRs.data);
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
      title={action === 'create' ? 'Crear requisición' : 'Actualizar requisición'}
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
              <Grid size={{ xs: 12, sm: 6 }}>
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

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="proccess"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Proceso *"
                      {...field}
                      error={Boolean(errors.proccess)}
                      helperText={errors.proccess && errors.proccess.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {proccessList.map((proccess: any) => (
                        <MenuItem key={proccess.PK} value={proccess.PK}>
                          {proccess.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="deliveryPlace"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Lugar de entrega *"
                      {...field}
                      error={Boolean(errors.deliveryPlace)}
                      helperText={errors.deliveryPlace && errors.deliveryPlace.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="costCenter"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Proyecto *"
                      {...field}
                      error={Boolean(errors.costCenter)}
                      helperText={errors.costCenter && errors.costCenter.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {costCenterList.map((costCenter: any) => (
                        <MenuItem key={costCenter.PK} value={costCenter.PK}>
                          {costCenter.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="checker1"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Revisión 1 *"
                      {...field}
                      error={Boolean(errors.checker1)}
                      helperText={errors.checker1 && errors.checker1.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {userList.map((user: any) => (
                        <MenuItem key={user.PK} value={user.PK}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="checker2"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Revisión 2 (HSE si aplica)"
                      {...field}
                      error={Boolean(errors.checker2)}
                      helperText={errors.checker2 && errors.checker2.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {userList.map((user: any) => (
                        <MenuItem key={user.PK} value={user.PK}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Controller
                  name="approver"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Aprueba *"
                      {...field}
                      error={Boolean(errors.approver)}
                      helperText={errors.approver && errors.approver.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      {userList.map((user: any) => (
                        <MenuItem key={user.PK} value={user.PK}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="observations"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      maxRows={10}
                      size="small"
                      label="Observaciones"
                      {...field}
                      error={Boolean(errors.observations)}
                      helperText={errors.observations && errors.observations.message}
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
                  {action === 'create' ? 'Crear requisición' : 'Actualizar requisición'}
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
