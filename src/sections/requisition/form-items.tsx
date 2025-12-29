import { z } from 'zod';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FieldValues, useForm } from 'react-hook-form';

import { Alert, Autocomplete, Button, Grid, MenuItem, TextField } from '@mui/material';

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
  const schema = z
    .object({
      PK: z.string().optional(),
      SK: z.string().optional(),
      ingredient: z.string().nonempty(_errors.required),
      grossCost: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[0-9.]+$/, _errors.regex)
        .regex(/^([0-9]+.?[0-9]{0,2})$/, _errors.decimals)
        .refine((val) => !(Number(val) < 0), {
          message: `${_errors.min} 0`,
        }),
      quantity: z
        .string()
        .nonempty(_errors.required)
        .regex(/^[0-9.]+$/, _errors.regex)
        .regex(/^([0-9]+.?[0-9]{0,2})$/, _errors.decimals)
        .refine((val) => !(Number(val) < 0), {
          message: `${_errors.min} 0`,
        }),
      brand: z
        .string()
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ&0-9-. ]+$/, _errors.regex)
        .max(255, _errors.maxLength)
        .optional()
        .or(z.literal('')),
      presentation: z
        .string()
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ&0-9-. ]+$/, _errors.regex)
        .max(255, _errors.maxLength)
        .optional()
        .or(z.literal('')),
      yieldInclude: z.string().optional().or(z.literal('')),
    })
    .superRefine((data, ctx) => {
      if (currentDishCategory === 'CATEGORY1' && !data.yieldInclude) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: _errors.required,
          path: ['yieldInclude'],
        });
      }
    });

  const defaultValues = {
    PK: '',
    SK: '',
    ingredient: '',
    grossCost: '',
    quantity: '',
    brand: '',
    presentation: '',
    yieldInclude: '',
  };

  type FormData = z.infer<typeof schema>;

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [ingredientList, setIngredientList] = useState<any[]>([]);
  const [pricesList, setPricesList] = useState<any[]>([]);
  const [currentDishCategory, setCurrentDishCategory] = useState('');

  const [selectedIngredient, setSelectedIngredient] = useState<any>({});
  const [unitPrice, setUnitPrice] = useState(0);
  const [total, setTotal] = useState(0);

  const [isSavingData, setIsSavingData] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
    clearErrors,
    setValue,
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
      clearSelectedIngredient();
      setOpenDialog(true);

      const fetchData = async () => {
        const axiosRoutes = [ItemService.getItem({ all: 'ALL' })];

        if (action === 'update') {
          axiosRoutes.push(
            RequisitionService.getItem({
              PK: requisitionPK,
              SK: itemSK,
              action: 'UPDATE',
              type: 'U',
            })
          );
        }

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((categoryRs, storageRs, dishRs) => {
              if (action === 'update' && dishRs?.data) {
                const data = dishRs.data;

                data.portions = String(data.portions);
                data.costPercentage = String(data.costPercentage);
                data.unforeseen = String(data.unforeseen);
                data.iva = String(data.iva);
                data.impoconsumo = String(data.impoconsumo);
                data.fixedPrice = String(data.fixedPrice);

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
      if (name === 'ingredient' && values.ingredient) {
        const selected = ingredientList.find((item) => item.SK === values.ingredient);
        if (!selected) return;

        const findPrice = pricesList.find((element: any) => element.SK === selected.SK);

        if (selected.SK.includes('DISH')) {
          setValue('grossCost', findPrice ? findPrice.price : selected.presentationCost);
        } else {
          if (findPrice) setValue('grossCost', findPrice.price);
        }

        setSelectedIngredient(selected || {});
        calculateUnitPrice();
      }
    });
    return () => subscription.unsubscribe();
  }, [ingredientList, watch]);

  useEffect(() => {
    if (selectedIngredient) {
      calculateUnitPrice();
    }
  }, [selectedIngredient]);

  const calculateUnitPrice = () => {
    const unitPriceCalc = selectedIngredient.weight
      ? Number(control._formValues.grossCost) / selectedIngredient.weight
      : Number(control._formValues.grossCost) / 1;

    setUnitPrice(unitPriceCalc);
    calculateTotal();
  };

  const calculateTotal = () => {
    const unitPriceCalc = selectedIngredient.weight
      ? Number(control._formValues.grossCost) / selectedIngredient.weight
      : Number(control._formValues.grossCost) / 1;

    const totalCalc = unitPriceCalc * Number(control._formValues.quantity);

    setTotal(totalCalc);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    onCloseForm();
  };

  const clearSelectedIngredient = () => {
    setSelectedIngredient({});
    setValue('grossCost', '');
    setUnitPrice(0);
    setTotal(0);
  };

  const cleanMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const onSubmit = async (data: FieldValues) => {
    setIsSavingData(true);
    cleanMessages();

    data.grossCost = Number(data.grossCost);
    data.quantity = Number(data.quantity);

    if (!data.brand) delete data.brand;
    if (!data.presentation) delete data.presentation;
    if (!data.yieldInclude) delete data.yieldInclude;

    data.PK = requisitionPK;

    if (action === 'update') data.SK = itemSK;
    else data.SK = itemSK;

    const itemRq =
      action === 'create'
        ? RequisitionService.createItem(data)
        : RequisitionService.updateItem(data);

    itemRq
      .then((itemRs) => {
        setSuccessMessage('Operación realizada con éxito');
        if (action === 'create') {
          reset(defaultValues);
          clearSelectedIngredient();
        }
        clearErrors(['grossCost']);
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
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField
                  disabled
                  fullWidth
                  size="small"
                  label="Código"
                  value={selectedIngredient.code ? selectedIngredient.code : ''}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <Controller
                  name="ingredient"
                  control={control}
                  render={({ field }) => {
                    const selected = ingredientList.find((item) => item.SK === field.value) || '';

                    return (
                      <Autocomplete
                        size="small"
                        {...field}
                        options={ingredientList}
                        noOptionsText="No hay resultados"
                        getOptionLabel={(option) => option.name || ''}
                        isOptionEqualToValue={(option, value) => option.SK === value.SK}
                        value={selected}
                        onChange={(event, newValue) => {
                          field.onChange(newValue ? newValue.SK : '');
                        }}
                        onInputChange={(event, newInputValue, reason) => {
                          if (reason === 'clear') clearSelectedIngredient();
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Ingrediente *"
                            error={Boolean(errors.ingredient)}
                            helperText={errors.ingredient && errors.ingredient.message}
                          />
                        )}
                      />
                    );
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="grossCost"
                  control={control}
                  render={({ field }) => (
                    <NumericFormat
                      disabled={isSavingData}
                      fullWidth
                      size="small"
                      label="Costo bruto *"
                      customInput={TextField}
                      thousandSeparator
                      decimalScale={2}
                      fixedDecimalScale
                      prefix="$ "
                      error={Boolean(errors.grossCost)}
                      helperText={errors.grossCost && errors.grossCost.message}
                      value={field.value}
                      onValueChange={(values) => {
                        field.onChange(values.value);
                        calculateUnitPrice();
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                      onChange={(e) => {
                        field.onChange(e);
                        calculateTotal();
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  disabled
                  fullWidth
                  size="small"
                  label="Unidad"
                  value={selectedIngredient.unit ? selectedIngredient.unit : ''}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Controller
                  name="brand"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Marca/Proveedor"
                      {...field}
                      error={Boolean(errors.brand)}
                      helperText={errors.brand && errors.brand.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  name="presentation"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label="Presentación"
                      {...field}
                      error={Boolean(errors.presentation)}
                      helperText={errors.presentation && errors.presentation.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <NumericFormat
                  disabled
                  fullWidth
                  size="small"
                  label="Precio unitario"
                  value={unitPrice}
                  customInput={TextField}
                  thousandSeparator
                  decimalScale={2}
                  fixedDecimalScale
                  prefix="$ "
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <NumericFormat
                  disabled
                  fullWidth
                  size="small"
                  label="Importe"
                  value={total}
                  customInput={TextField}
                  thousandSeparator
                  decimalScale={2}
                  fixedDecimalScale
                  prefix="$ "
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Controller
                  disabled={currentDishCategory !== 'CATEGORY1'}
                  name="yieldInclude"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label={
                        'Incluir en rendimiento' + (currentDishCategory === 'CATEGORY1' ? ' *' : '')
                      }
                      {...field}
                      error={Boolean(errors.yieldInclude)}
                      helperText={errors.yieldInclude && errors.yieldInclude.message}
                    >
                      <MenuItem value="">Seleccione</MenuItem>
                      <MenuItem value="Si">Si</MenuItem>
                      <MenuItem value="No">No</MenuItem>
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
