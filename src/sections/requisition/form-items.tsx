import 'dayjs/locale/es';

import { z } from 'zod';
import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FieldValues, useForm } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Alert, Autocomplete, Button, Grid, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { _errors } from 'src/utils/input-errors';

import ItemService from 'src/services/item-coding/item-coding-service';
import RequisitionService from 'src/services/requisition/requisition-service';

import { Loading } from 'src/components/loading';
import { ModalDialog } from 'src/components/modal-dialog';

// ----------------------------------------------------------------------

interface Props {
  openForm: boolean;
  action: string;
  requisitionPK?: string;
  itemSK?: string;
  onCloseForm: () => void;
  handleSavedData: (data: any) => void;
}

export function FormItems({
  openForm,
  action,
  requisitionPK,
  itemSK,
  onCloseForm,
  handleSavedData,
}: Props) {
  const schema = z.object({
    PK: z.string().optional(),
    item: z.string().nonempty(_errors.required),
    quantity: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[0-9.]+$/, _errors.regex)
      .regex(/^([0-9]+.?[0-9]{0,2})$/, _errors.decimals)
      .refine((val) => !(Number(val) < 0.01), {
        message: `${_errors.min} 0.01`,
      }),
    requiredDate: z.string().nonempty(_errors.required),
  });

  const defaultValues = {
    PK: '',
    item: '',
    quantity: '',
    requiredDate: '',
  };

  type FormData = z.infer<typeof schema>;

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [itemList, setItemList] = useState<any[]>([]);

  const [selectedItem, setSelectedItem] = useState<any>({});

  const [isSavingData, setIsSavingData] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
    disabled: isSavingData,
    mode: 'onTouched',
  });

  useEffect(() => {
    if (openForm) {
      setIsLoading(true);
      setGlobalError(false);

      reset(defaultValues);
      cleanMessages();
      clearSelectedItem();
      setOpenDialog(true);

      const fetchData = async () => {
        const axiosRoutes = [ItemService.getItem({ all: 'ALL' })];

        if (action === 'update') {
          axiosRoutes.push(
            RequisitionService.getItem({
              PK: requisitionPK,
              SK: itemSK,
              action: 'UPDATE',
            })
          );
        }

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((itemRs, requisitionRs) => {
              setItemList(itemRs?.data);

              if (action === 'update' && requisitionRs?.data) {
                const data = requisitionRs.data;

                data.quantity = String(data.quantity);

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
    const subscription = watch((values, { name }) => {
      if (name === 'item' && values.item) {
        const selected = itemList.find((item) => item.PK === values.item);
        if (!selected) return;

        setSelectedItem(selected || {});
      }
    });
    return () => subscription.unsubscribe();
  }, [itemList, watch]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    onCloseForm();
  };

  const clearSelectedItem = () => {
    setSelectedItem({});
  };

  const cleanMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const onSubmit = async (data: FieldValues) => {
    setIsSavingData(true);
    cleanMessages();

    data.quantity = Number(data.quantity);
    data.PK = requisitionPK;

    if (action === 'update') data.SK = itemSK;

    const itemRq =
      action === 'create'
        ? RequisitionService.createItem(data)
        : RequisitionService.updateItem(data);

    itemRq
      .then((itemRs) => {
        setSuccessMessage('Operación realizada con éxito');
        if (action === 'create') {
          reset(defaultValues);
          clearSelectedItem();
        }
        setIsSavingData(false);
        handleSavedData(itemRs.data);
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
      title={action === 'create' ? 'Crear item' : 'Actualizar item'}
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  name="item"
                  control={control}
                  render={({ field }) => {
                    const selected = itemList.find((item) => item.PK === field.value) || '';

                    return (
                      <Autocomplete
                        size="small"
                        {...field}
                        options={itemList}
                        noOptionsText="No hay resultados"
                        getOptionLabel={(option) => option.name || ''}
                        isOptionEqualToValue={(option, value) => option.PK === value.PK}
                        value={selected}
                        onChange={(event, newValue) => {
                          field.onChange(newValue ? newValue.PK : '');
                        }}
                        onInputChange={(event, newInputValue, reason) => {
                          if (reason === 'clear') clearSelectedItem();
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Item *"
                            error={Boolean(errors.item)}
                            helperText={errors.item && errors.item.message}
                          />
                        )}
                      />
                    );
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  disabled
                  fullWidth
                  size="small"
                  label="Unidad de medida"
                  value={selectedItem.unit ? selectedItem.unit : ''}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Cantidad *"
                      {...field}
                      error={Boolean(errors.quantity)}
                      helperText={errors.quantity && errors.quantity.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  name="requiredDate"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                      <DatePicker
                        disabled={isSavingData}
                        label="Fecha requerida"
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            error: Boolean(errors.requiredDate),
                            helperText: errors.requiredDate && errors.requiredDate.message,
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
                  {action === 'create' ? 'Crear item' : 'Actualizar item'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </>
      )}
    </ModalDialog>
  );
}
