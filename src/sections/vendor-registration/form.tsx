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
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import { _errors } from 'src/utils/input-errors';
import { compressFile } from 'src/utils/compress-files';

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
  const schema = z.object({
    typePerson: z.string().nonempty(_errors.required),
    name: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$/, _errors.regex)
      .max(255, _errors.maxLength),
    typeId: z.string().nonempty(_errors.required),
    numberId: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[0-9]+$/, _errors.regex)
      .max(15, _errors.maxLength),
    dv: z
      .string()
      .regex(/^[0-9]+$/, _errors.regex)
      .max(1, _errors.maxLength)
      .optional()
      .or(z.literal('')),
    country: z.string().nonempty(_errors.required),
    city: z.string().nonempty(_errors.required),
    sector: z.string().optional().or(z.literal('')),
    phone: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[a-zA-Z0-9- ]+$/, _errors.regex)
      .max(50, _errors.maxLength),
    address: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[a-zA-Z0-9-#áéíóúÁÉÍÓÚ ]+$/, _errors.regex)
      .max(255, _errors.maxLength),
    email: z.string().email(_errors.email).max(100, _errors.maxLength).optional().or(z.literal('')),
    web: z
      .string()
      .regex(/^[a-zA-Z0-9-. ]+$/, _errors.regex)
      .max(255, _errors.maxLength)
      .optional()
      .or(z.literal('')),
    buttonsColor: z.string().optional().or(z.literal('')),
    titlesColor: z.string().optional().or(z.literal('')),
    titlesPdfColor: z.string().optional().or(z.literal('')),
    backgroundPdfColor: z.string().optional().or(z.literal('')),
    borderTablesPdfColor: z.string().optional().or(z.literal('')),
    fileExtension: z.string().optional().or(z.literal('')),
    fileExtensionPdf: z.string().optional().or(z.literal('')),
  });

  const defaultValues = {
    typePerson: '',
    name: '',
    typeId: '',
    numberId: '',
    dv: '',
    country: '',
    city: '',
    sector: '',
    phone: '',
    address: '',
    email: '',
    web: '',
    buttonsColor: undefined,
    titlesColor: undefined,
    titlesPdfColor: undefined,
    backgroundPdfColor: undefined,
    borderTablesPdfColor: undefined,
    fileExtension: '',
    fileExtensionPdf: '',
  };

  type FormData = z.infer<typeof schema>;

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [countryList, setCountryList] = useState<any[]>([]);
  const [cityList, setCityList] = useState<any[]>([]);
  const [sectorList, setSectorList] = useState<any[]>([]);

  const [openDialogAdd, setOpenDialogAdd] = useState(false);
  const [lableAdd, setLabelAdd] = useState('');
  const [entityAdd, setEntityAdd] = useState('');
  const [currentAddData, setCurrentAddData] = useState<any[]>([]);

  const [fileLogoName, setFileLogoName] = useState<string | undefined>('');
  const [urlLogo, setUrlLogo] = useState<string | undefined>('');
  const [fileLogo, setFileLogo] = useState<File>();
  const [compressedLogoFile, setCompressedLogoFile] = useState<File>();

  const [fileHeaderName, setFileHeaderName] = useState<string | undefined>('');
  const [urlHeader, setUrlHeader] = useState<string | undefined>('');
  const [fileHeader, setFileHeader] = useState<File>();
  const [compressedHeaderFile, setCompressedHeaderFile] = useState<File>();
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
      setUrlLogo('');
      setUrlHeader('');
      setFileLogoName('');
      setFileHeaderName('');
      cleanMessages();
      setOpenDialog(true);

      const fetchData = async () => {
        const axiosRoutes = [
          sharedServices.getList({ entity: 'COUNTRY' }),
          sharedServices.getList({ entity: 'CITY' }),
          sharedServices.getList({ entity: 'SECTOR' }),
        ];

        if (action === 'update') {
          axiosRoutes.push(VendorService.getVendor({ PK: PK, action: 'UPDATE', type: 'U' }));
        }

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((countryRs, cityRs, sectorRs, clientRs) => {
              setCountryList(countryRs.data);
              setCityList(cityRs.data);
              setSectorList(sectorRs.data);

              if (action === 'update' && clientRs?.data) {
                const data = clientRs.data;
                if (data.dv) data.dv = String(data.dv);
                reset(data);
                setValue('fileExtension', '');
                setValue('fileExtensionPdf', '');
                if (clientRs.data.getUrlLogo) setUrlLogo(clientRs.data.getUrlLogo);
                if (clientRs.data.getUrlHeader) setUrlHeader(clientRs.data.getUrlHeader);
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
    if (fileLogo) {
      setIsCompressingFile(true);
      const getNewFile = async () => {
        const newFile = await compressFile(fileLogo, 'auto');

        setCompressedLogoFile(newFile);
        setFileLogoName(newFile.name);
        setValue(`fileExtension`, newFile.name.split('.').pop());
        setUrlLogo('');
        setTimeout(() => setIsCompressingFile(false), 1000);
      };

      getNewFile();
    }
  }, [fileLogo]);

  useEffect(() => {
    if (fileHeader) {
      setIsCompressingFile(true);
      const getNewFile = async () => {
        const newFile = await compressFile(fileHeader, 1000);

        setCompressedHeaderFile(newFile);
        setFileHeaderName(newFile.name);
        setValue(`fileExtensionPdf`, newFile.name.split('.').pop());
        setUrlHeader('');
        setTimeout(() => setIsCompressingFile(false), 1000);
      };

      getNewFile();
    }
  }, [fileHeader]);

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
    if (entityAdd === 'COUNTRY') {
      setCountryList((prev) => [...prev, data.data]);
      setValue(`country`, data.data.PK);
    } else if (entityAdd === 'CITY') {
      setCityList((prev) => [...prev, data.data]);
      setValue(`city`, data.data.PK);
    } else if (entityAdd === 'SECTOR') {
      setSectorList((prev) => [...prev, data.data]);
      setValue(`sector`, data.data.PK);
    }
  };

  const onFileLogoSelected = (event: any) => {
    setFileLogo(event.target.files[0]);
  };

  const onFileHeaderSelected = (event: any) => {
    setFileHeader(event.target.files[0]);
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

  const onSubmit = async (data: FieldValues) => {
    setIsSavingData(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (!data.dv) delete data.dv;
    else data.dv = Number(data.dv);
    if (!data.sector) delete data.sector;
    if (!data.email) delete data.email;
    if (!data.web) delete data.web;
    if (!data.buttonsColor) delete data.buttonsColor;
    if (!data.titlesColor) delete data.titlesColor;
    if (!data.titlesPdfColor) delete data.titlesPdfColor;
    if (!data.backgroundPdfColor) delete data.backgroundPdfColor;
    if (!data.borderTablesPdfColor) delete data.borderTablesPdfColor;
    if (!data.fileExtension) delete data.fileExtension;
    if (!data.fileExtensionPdf) delete data.fileExtensionPdf;
    if (action === 'update') data.PK = PK;

    const clientRq =
      action === 'create' ? VendorService.createVendor(data) : VendorService.updateVendor(data);

    clientRq
      .then((clientRs) => {
        let errorCount = 0;

        if (clientRs.data.putUrlLogo) {
          const fileRq = sharedServices.uploadFile(clientRs.data.putUrlLogo, compressedLogoFile!);

          fileRq
            .then((fileRs) => {})
            .catch((fileError) => {
              errorCount++;
            });
          setFileLogoName('');
        }

        if (clientRs.data.putUrlHeader) {
          const fileRq = sharedServices.uploadFile(
            clientRs.data.putUrlHeader,
            compressedHeaderFile!
          );

          fileRq
            .then((fileRs) => {})
            .catch((fileError) => {
              errorCount++;
            });
          setFileHeaderName('');
        }

        if (errorCount > 0) {
          seAtttachedErrorMessage(
            'El registro se guardó correctamente pero se ha presentado un error al subir un archivo'
          );
          afterSubmit();
        } else {
          setSuccessMessage('Operación realizada con éxito');
          afterSubmit();
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
      title={action === 'create' ? 'Crear cliente' : 'Actualizar cliente'}
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

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Controller
                  name="typePerson"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Tipo persona *"
                      {...field}
                      error={Boolean(errors.typePerson)}
                      helperText={errors.typePerson && errors.typePerson.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="Natural">Natural</MenuItem>
                      <MenuItem value="Jurídica">Jurídica</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Controller
                  name="typeId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Tipo identificación *"
                      {...field}
                      error={Boolean(errors.typeId)}
                      helperText={errors.typeId && errors.typeId.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="Nit">NIT</MenuItem>
                      <MenuItem value="Cédula">Cédula</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  name="numberId"
                  control={control}
                  render={({ field }) => (
                    <TextField
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
                      fullWidth
                      size="small"
                      label="DV"
                      {...field}
                      error={Boolean(errors.dv)}
                      helperText={errors.dv && errors.dv.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="País *"
                      {...field}
                      error={Boolean(errors.country)}
                      helperText={errors.country && errors.country.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => onOpenDialogAdd('COUNTRY', 'país', countryList)}
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
                      {countryList.map((country: any) => (
                        <MenuItem key={country.PK} value={country.PK}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </TextField>
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
                  name="sector"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Sector"
                      {...field}
                      error={Boolean(errors.sector)}
                      helperText={errors.sector && errors.sector.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => onOpenDialogAdd('SECTOR', 'sector', sectorList)}
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
                      {sectorList.map((sector: any) => (
                        <MenuItem key={sector.PK} value={sector.PK}>
                          {sector.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Email"
                      {...field}
                      error={Boolean(errors.email)}
                      helperText={errors.email && errors.email.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  name="web"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Página web"
                      {...field}
                      error={Boolean(errors.web)}
                      helperText={errors.web && errors.web.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="buttonsColor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="color"
                      fullWidth
                      size="small"
                      label="Color botones"
                      {...field}
                      error={Boolean(errors.buttonsColor)}
                      helperText={errors.buttonsColor && errors.buttonsColor.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="titlesColor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="color"
                      fullWidth
                      size="small"
                      label="Color título"
                      {...field}
                      error={Boolean(errors.titlesColor)}
                      helperText={errors.titlesColor && errors.titlesColor.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="titlesPdfColor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="color"
                      fullWidth
                      size="small"
                      label="Color títulos PDF"
                      {...field}
                      error={Boolean(errors.titlesPdfColor)}
                      helperText={errors.titlesPdfColor && errors.titlesPdfColor.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="backgroundPdfColor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="color"
                      fullWidth
                      size="small"
                      label="Color fondo títulos tablas PDF"
                      {...field}
                      error={Boolean(errors.backgroundPdfColor)}
                      helperText={errors.backgroundPdfColor && errors.backgroundPdfColor.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="borderTablesPdfColor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      type="color"
                      fullWidth
                      size="small"
                      label="Color bordes tablas PDF"
                      {...field}
                      error={Boolean(errors.borderTablesPdfColor)}
                      helperText={
                        errors.borderTablesPdfColor && errors.borderTablesPdfColor.message
                      }
                    />
                  )}
                />
              </Grid>

              <Grid
                size={12}
                sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Typography sx={{ m: 0 }}>
                  Logo: {fileLogoName || 'Aún no se ha subido ningún archivo.'}
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
                    onChange={onFileLogoSelected}
                  />
                </Button>

                {urlLogo !== '' && (
                  <Link href={urlLogo} target="_blank" sx={{ m: 0, cursor: 'pointer' }}>
                    Descargar archivo adjunto
                  </Link>
                )}
              </Grid>

              <Grid
                size={12}
                sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Typography sx={{ m: 0 }}>
                  Header: {fileHeaderName || 'Aún no se ha subido ningún archivo.'}
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
                    onChange={onFileHeaderSelected}
                  />
                </Button>

                {urlHeader !== '' && (
                  <Link href={urlHeader} target="_blank" sx={{ m: 0, cursor: 'pointer' }}>
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
                  {action === 'create' ? 'Crear cliente' : 'Actualizar cliente'}
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
