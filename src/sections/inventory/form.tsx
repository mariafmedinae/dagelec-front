import { z } from 'zod';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FieldValues, Controller } from 'react-hook-form';

import { Alert, Autocomplete, Button, Grid, TextField } from '@mui/material';

import { _errors } from 'src/utils/input-errors';

import ItemService from 'src/services/item-coding/item-coding-service';
import inventoryService from 'src/services/inventory/inventory-service';

import { Loading } from 'src/components/loading';
import { ModalDialog } from 'src/components/modal-dialog';

// ----------------------------------------------------------------------

interface Props {
  openForm: boolean;
  action: string;
  PK?: string;
  onCloseForm: () => void;
}

export function Form({ openForm, action, PK, onCloseForm }: Props) {
  const schema = z.object({
    item: z.string().max(20, _errors.maxLength).nonempty(_errors.required),
    code: z.string().nonempty(_errors.required),
    quantity: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[0-9.]+$/, _errors.regex)
      .regex(/^([0-9]+.?[0-9]{0,2})$/, _errors.decimals)
      .refine((val) => !(Number(val) < 0.01), {
        message: `${_errors.min} 0.01`,
      }),
  });

  const defaultValues = {
    item: '',
    code: '',
    quantity: '',
  };

  type FormData = z.infer<typeof schema>;

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [itemList, setItemList] = useState<any[]>([]);

  const [selectedItem, setSelectedItem] = useState<any>({});

  const [isSavingData, setIsSavingData] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<any>('');

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
    mode: 'onChange',
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

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((itemRs) => {
              setItemList(itemRs?.data);

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

  const afterSubmit = () => {
    if (action === 'create') {
      reset(defaultValues);
      clearSelectedItem();
    }
    setIsSavingData(false);
  };

  const onSubmit = async (data: FieldValues) => {
    setIsSavingData(true);
    cleanMessages();

    data.quantity = Number(data.quantity);

    const inventoryRq = inventoryService.createInventory(data);

    inventoryRq
      .then((inventoryRs) => {
        setSuccessMessage('Operación realizada con éxito');
        afterSubmit();
      })
      .catch((error) => {
        if (error.response) setErrorMessage(error.response.data);
        else setErrorMessage('Se ha presentado un error. Intente nuevamente');
        setIsSavingData(false);
      });
  };

  return (
    <ModalDialog isOpen={openDialog} handleClose={handleDialogClose} title="Crear item">
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

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled
                  fullWidth
                  size="small"
                  label="Unidad de medida"
                  value={selectedItem.unit ? selectedItem.unit : ''}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Código *"
                      {...field}
                      error={Boolean(errors.code)}
                      helperText={errors.code && errors.code.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
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
                  Crear item
                </Button>
              </Grid>
            </Grid>
          </form>
        </>
      )}
    </ModalDialog>
  );
}
