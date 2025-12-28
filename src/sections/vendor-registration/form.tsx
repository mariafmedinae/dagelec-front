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
  Grid,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  TextField,
  Typography,
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
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ&0-9-. ]+$/, _errors.regex)
        .max(255, _errors.maxLength),
      numberId: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[0-9]+$/, _errors.regex)
        .max(15, _errors.maxLength),
      dv: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[0-9]+$/, _errors.regex)
        .max(1, _errors.maxLength),
      address: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[a-zA-Z0-9-#áéíóúÁÉÍÓÚ ]+$/, _errors.regex)
        .max(255, _errors.maxLength),
      city: z.string().nonempty(_errors.required),
      department: z.string().nonempty(_errors.required),
      phone: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[a-zA-Z0-9- ]+$/, _errors.regex)
        .max(50, _errors.maxLength),
      typeActivity: z.string().nonempty(_errors.required),
      description: z.string().nonempty(_errors.required).max(510, _errors.maxLength),
      experience: z.string().nonempty(_errors.required).max(50, _errors.maxLength),
      ciiu: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[0-9.]+$/, _errors.regex)
        .regex(/^([0-9]+.?[0-9]{0,2})$/, _errors.decimals)
        .refine((val) => !(Number(val) > 999999), {
          message: `${_errors.max} 999.999`,
        })
        .refine((val) => !(Number(val) < 0), {
          message: `${_errors.min} 0`,
        }),
      term: z.string().nonempty(_errors.required).max(100, _errors.maxLength),
      discount: z
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
      bank: z.string().nonempty(_errors.required).max(100, _errors.maxLength),
      accountNumber: z.string().nonempty(_errors.required).max(50, _errors.maxLength),
      accountType: z.string().nonempty(_errors.required),
      ivaType: z.string().nonempty(_errors.required),
      incomeTaxPayer: z.string().nonempty(_errors.required),
      bigTaxPayer: z.string().nonempty(_errors.required),
      resolutionBigTaxPayer: z.string().max(50, _errors.maxLength).optional().or(z.literal('')),
      dateBigTaxPayer: z.string().optional().or(z.literal('')),
      selfRetaining: z.string().nonempty(_errors.required),
      resolutionSelfRetaining: z.string().max(50, _errors.maxLength).optional().or(z.literal('')),
      dateSelfRetaining: z.string().optional().or(z.literal('')),
      industryTaxResponsible: z.string().nonempty(_errors.required),
      industryTaxCity: z.string().optional().or(z.literal('')),
      industryTaxCode: z.string().max(50, _errors.maxLength).optional().or(z.literal('')),
      industryTaxRate: z.string().max(50, _errors.maxLength).optional().or(z.literal('')),
      legalRepresentative: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ&0-9-. ]+$/, _errors.regex)
        .max(255, _errors.maxLength),
    })
    .superRefine((data, ctx) => {
      if (data.bigTaxPayer === 'SI' && !data.resolutionBigTaxPayer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: _errors.required,
          path: ['resolutionBigTaxPayer'],
        });
      }

      if (data.bigTaxPayer === 'SI' && !data.dateBigTaxPayer) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: _errors.required,
          path: ['dateBigTaxPayer'],
        });
      }

      if (data.selfRetaining === 'SI' && !data.resolutionSelfRetaining) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: _errors.required,
          path: ['resolutionSelfRetaining'],
        });
      }

      if (data.selfRetaining === 'SI' && !data.dateSelfRetaining) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: _errors.required,
          path: ['dateSelfRetaining'],
        });
      }

      if (data.industryTaxResponsible === 'SI' && !data.industryTaxCity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: _errors.required,
          path: ['industryTaxCity'],
        });
      }

      if (data.industryTaxResponsible === 'SI' && !data.industryTaxCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: _errors.required,
          path: ['industryTaxCode'],
        });
      }

      if (data.industryTaxResponsible === 'SI' && !data.industryTaxRate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: _errors.required,
          path: ['industryTaxRate'],
        });
      }
    });

  const defaultValues = {
    name: '',
    numberId: '',
    dv: '',
    address: '',
    city: '',
    department: '',
    phone: '',
    typeActivity: '',
    description: '',
    experience: '',
    ciiu: '',
    term: '',
    discount: '',
    bank: '',
    accountNumber: '',
    accountType: '',
    ivaType: '',
    incomeTaxPayer: '',
    bigTaxPayer: '',
    resolutionBigTaxPayer: '',
    dateBigTaxPayer: '',
    selfRetaining: '',
    resolutionSelfRetaining: '',
    dateSelfRetaining: '',
    industryTaxResponsible: '',
    industryTaxCity: '',
    industryTaxCode: '',
    industryTaxRate: '',
    legalRepresentative: '',
  };

  type FormData = z.infer<typeof schema>;

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [departmentList, setDepartmentList] = useState<any[]>([]);
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

  const bigTaxPayerValue = useWatch({ control, name: 'bigTaxPayer' });
  const selfRetainingValue = useWatch({ control, name: 'selfRetaining' });
  const industryTaxResponsibleValue = useWatch({ control, name: 'industryTaxResponsible' });

  useEffect(() => {
    if (openForm) {
      setIsLoading(true);
      setGlobalError(false);

      reset(defaultValues);
      cleanMessages();
      setOpenDialog(true);

      const fetchData = async () => {
        const axiosRoutes = [
          sharedServices.getList({ entity: 'DEPARTMENT' }),
          sharedServices.getList({ entity: 'CITY' }),
        ];

        if (action === 'update') {
          axiosRoutes.push(VendorService.getVendor({ PK: PK, action: 'UPDATE', type: 'U' }));
        }

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((departmentRs, cityRs, vendorRs) => {
              setDepartmentList(departmentRs.data);
              setCityList(cityRs.data);

              if (action === 'update' && vendorRs?.data) {
                const data = vendorRs.data;
                data.dv = String(data.dv);
                data.ciiu = String(data.ciiu);
                data.discount = String(data.discount);
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

  useEffect(() => {
    if (bigTaxPayerValue !== 'SI') {
      setValue('resolutionBigTaxPayer', '');
      setValue('dateBigTaxPayer', '');
      clearErrors(['resolutionBigTaxPayer', 'dateBigTaxPayer']);
    }
  }, [bigTaxPayerValue]);

  useEffect(() => {
    if (selfRetainingValue !== 'SI') {
      setValue('resolutionSelfRetaining', '');
      setValue('dateSelfRetaining', '');
      clearErrors(['resolutionSelfRetaining', 'dateSelfRetaining']);
    }
  }, [selfRetainingValue]);

  useEffect(() => {
    if (industryTaxResponsibleValue !== 'SI') {
      setValue('industryTaxCity', '');
      setValue('industryTaxCode', '');
      setValue('industryTaxRate', '');
      clearErrors(['industryTaxCity', 'industryTaxCode', 'industryTaxRate']);
    }
  }, [industryTaxResponsibleValue]);

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
    if (entityAdd === 'DEPARTMENT') {
      setDepartmentList((prev) => [...prev, data.data]);
      setValue(`department`, data.data.PK);
    } else if (entityAdd === 'CITY') {
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
    setSuccessMessage('');
    setErrorMessage('');

    data.dv = Number(data.dv);
    data.ciiu = Number(data.ciiu);
    data.discount = Number(data.discount);

    if (!data.resolutionBigTaxPayer) delete data.resolutionBigTaxPayer;
    if (!data.dateBigTaxPayer) delete data.dateBigTaxPayer;
    if (!data.resolutionSelfRetaining) delete data.resolutionSelfRetaining;
    if (!data.dateSelfRetaining) delete data.dateSelfRetaining;
    if (!data.industryTaxCity) delete data.industryTaxCity;
    if (!data.industryTaxCode) delete data.industryTaxCode;
    if (!data.industryTaxRate) delete data.industryTaxRate;
    if (action === 'update') data.PK = PK;

    const vendorRq =
      action === 'create' ? VendorService.createVendor(data) : VendorService.updateVendor(data);

    vendorRq
      .then((vendorRs) => {
        setSuccessMessage('Operación realizada con éxito');
        afterSubmit();

        handleSavedData(vendorRs.data);
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
      title={action === 'create' ? 'Crear proveedor' : 'Actualizar proveedor'}
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
                      label="Nombre/Razón social *"
                      {...field}
                      error={Boolean(errors.name)}
                      helperText={errors.name && errors.name.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  name="numberId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={action === 'update'}
                      fullWidth
                      size="small"
                      label="Número *"
                      {...field}
                      error={Boolean(errors.numberId)}
                      helperText={errors.numberId && errors.numberId.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 1 }}>
                <Controller
                  name="dv"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={action === 'update'}
                      fullWidth
                      size="small"
                      label="DV *"
                      {...field}
                      error={Boolean(errors.dv)}
                      helperText={errors.dv && errors.dv.message}
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

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Departamento *"
                      {...field}
                      error={Boolean(errors.department)}
                      helperText={errors.department && errors.department.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  onOpenDialogAdd('DEPARTMENT', 'departamento', departmentList)
                                }
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
                      {departmentList.map((department: any) => (
                        <MenuItem key={department.PK} value={department.PK}>
                          {department.name}
                        </MenuItem>
                      ))}
                    </TextField>
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
                      label="Teléfono *"
                      {...field}
                      error={Boolean(errors.phone)}
                      helperText={errors.phone && errors.phone.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="typeActivity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Tipo de actividad *"
                      {...field}
                      error={Boolean(errors.typeActivity)}
                      helperText={errors.typeActivity && errors.typeActivity.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="DISTRIBUIDOR">DISTRIBUIDOR</MenuItem>
                      <MenuItem value="INTERMEDIARIO">INTERMEDIARIO</MenuItem>
                      <MenuItem value="FABRICANTE">FABRICANTE</MenuItem>
                      <MenuItem value="IMPORTADOR">IMPORTADOR</MenuItem>
                      <MenuItem value="SERVICIOS">SERVICIOS</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="experience"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Experiencia *"
                      {...field}
                      error={Boolean(errors.experience)}
                      helperText={errors.experience && errors.experience.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="ciiu"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="CIIU *"
                      {...field}
                      error={Boolean(errors.ciiu)}
                      helperText={errors.ciiu && errors.ciiu.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      maxRows={10}
                      size="small"
                      label="Descripción del producto o servicio a ofrecer *"
                      {...field}
                      error={Boolean(errors.description)}
                      helperText={errors.description && errors.description.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="term"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Plazo de pago *"
                      {...field}
                      error={Boolean(errors.term)}
                      helperText={errors.term && errors.term.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="discount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="% Descuento *"
                      {...field}
                      error={Boolean(errors.discount)}
                      helperText={errors.discount && errors.discount.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="bank"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Entidad bancaria *"
                      {...field}
                      error={Boolean(errors.bank)}
                      helperText={errors.bank && errors.bank.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  name="accountNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="No. de cuenta *"
                      {...field}
                      error={Boolean(errors.accountNumber)}
                      helperText={errors.accountNumber && errors.accountNumber.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  name="accountType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Tipo de cuenta *"
                      {...field}
                      error={Boolean(errors.accountType)}
                      helperText={errors.accountType && errors.accountType.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="AHORROS">AHORROS</MenuItem>
                      <MenuItem value="CORRIENTE">CORRIENTE</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  name="ivaType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Responsable IVA *"
                      {...field}
                      error={Boolean(errors.ivaType)}
                      helperText={errors.ivaType && errors.ivaType.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="REGIMEN COMUN">REGIMEN COMUN</MenuItem>
                      <MenuItem value="REGIMEN SIMPLIFICADO">REGIMEN SIMPLIFICADO</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  name="incomeTaxPayer"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Contribuyente imporenta *"
                      {...field}
                      error={Boolean(errors.incomeTaxPayer)}
                      helperText={errors.incomeTaxPayer && errors.incomeTaxPayer.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="SI">SI</MenuItem>
                      <MenuItem value="NO">NO</MenuItem>
                      <MenuItem value="REG. ESP.">REG. ESP.</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="bigTaxPayer"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Gran contribuyente *"
                      {...field}
                      error={Boolean(errors.bigTaxPayer)}
                      helperText={errors.bigTaxPayer && errors.bigTaxPayer.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="SI">SI</MenuItem>
                      <MenuItem value="NO">NO</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="resolutionBigTaxPayer"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={bigTaxPayerValue !== 'SI'}
                      fullWidth
                      size="small"
                      label={'No. resolución' + (bigTaxPayerValue === 'SI' ? ' *' : '')}
                      {...field}
                      error={Boolean(errors.resolutionBigTaxPayer)}
                      helperText={
                        errors.resolutionBigTaxPayer && errors.resolutionBigTaxPayer.message
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="dateBigTaxPayer"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                      <DatePicker
                        disabled={isSavingData || bigTaxPayerValue !== 'SI'}
                        label={'Fecha' + (bigTaxPayerValue === 'SI' ? ' *' : '')}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            error: Boolean(errors.dateBigTaxPayer),
                            helperText: errors.dateBigTaxPayer && errors.dateBigTaxPayer.message,
                          },
                        }}
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
                  name="selfRetaining"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Autorretenedor *"
                      {...field}
                      error={Boolean(errors.selfRetaining)}
                      helperText={errors.selfRetaining && errors.selfRetaining.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="SI">SI</MenuItem>
                      <MenuItem value="NO">NO</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="resolutionSelfRetaining"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={selfRetainingValue !== 'SI'}
                      fullWidth
                      size="small"
                      label={'No. resolución' + (selfRetainingValue === 'SI' ? ' *' : '')}
                      {...field}
                      error={Boolean(errors.resolutionSelfRetaining)}
                      helperText={
                        errors.resolutionSelfRetaining && errors.resolutionSelfRetaining.message
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="dateSelfRetaining"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                      <DatePicker
                        disabled={isSavingData || selfRetainingValue !== 'SI'}
                        label={'Fecha' + (selfRetainingValue === 'SI' ? ' *' : '')}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            error: Boolean(errors.dateSelfRetaining),
                            helperText:
                              errors.dateSelfRetaining && errors.dateSelfRetaining.message,
                          },
                        }}
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

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="industryTaxResponsible"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Responsable impuesto de industria y comercio *"
                      {...field}
                      error={Boolean(errors.industryTaxResponsible)}
                      helperText={
                        errors.industryTaxResponsible && errors.industryTaxResponsible.message
                      }
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="SI">SI</MenuItem>
                      <MenuItem value="NO">NO</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="industryTaxCity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={industryTaxResponsibleValue !== 'SI'}
                      select
                      fullWidth
                      size="small"
                      label={'Ciudad' + (industryTaxResponsibleValue === 'SI' ? ' *' : '')}
                      {...field}
                      error={Boolean(errors.industryTaxCity)}
                      helperText={errors.industryTaxCity && errors.industryTaxCity.message}
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

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="industryTaxCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={industryTaxResponsibleValue !== 'SI'}
                      fullWidth
                      size="small"
                      label={'Código activo' + (industryTaxResponsibleValue === 'SI' ? ' *' : '')}
                      {...field}
                      error={Boolean(errors.industryTaxCode)}
                      helperText={errors.industryTaxCode && errors.industryTaxCode.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="industryTaxRate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      disabled={industryTaxResponsibleValue !== 'SI'}
                      fullWidth
                      size="small"
                      label={'Tarifa' + (industryTaxResponsibleValue === 'SI' ? ' *' : '')}
                      {...field}
                      error={Boolean(errors.industryTaxRate)}
                      helperText={errors.industryTaxRate && errors.industryTaxRate.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 12 }}>
                <Controller
                  name="legalRepresentative"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Representante legal *"
                      {...field}
                      error={Boolean(errors.legalRepresentative)}
                      helperText={errors.legalRepresentative && errors.legalRepresentative.message}
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
                  {action === 'create' ? 'Crear proveedor' : 'Actualizar proveedor'}
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
