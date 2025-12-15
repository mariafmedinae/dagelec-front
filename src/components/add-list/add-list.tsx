import { z } from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FieldValues, useForm } from 'react-hook-form';

import { Alert, Button, Grid, TextField } from '@mui/material';

import { _errors } from 'src/utils/input-errors';
import { cleanString } from 'src/utils/clean-strings';

import sharedServices from 'src/services/shared/shared-services';

import { ModalDialog } from '../modal-dialog';

// ----------------------------------------------------------------------

interface Props {
  openDialog: boolean;
  includesCode?: boolean;
  label: string;
  entity: string;
  currentData: any;
  onCloseDialogAdd: () => void;
  onDataSend: (data: any) => void;
}

export function AddList({
  openDialog,
  includesCode = false,
  label,
  entity,
  currentData,
  onCloseDialogAdd,
  onDataSend,
}: Props) {
  const codeSchema = includesCode
    ? z.string().nonempty(_errors.required).max(10, _errors.maxLength)
    : z.string().max(10, _errors.maxLength).optional().or(z.literal(''));

  const schema = z.object({
    entity: z.string().optional().or(z.literal('')),
    name: z
      .string()
      .nonempty(_errors.required)
      .regex(/^[A-Za-zñÑáéíóúÁÉÍÓÚ0-9, .#\\-_\\s\\(\\)]+$/, _errors.regex),
    code: codeSchema,
  });

  const defaultValues = {
    entity: entity,
    name: '',
    code: '',
  };

  type FormData = z.infer<typeof schema>;

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues });

  const [openDialogAdd, setOpenDialogAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (openDialog) {
      cleanForm();
      setOpenDialogAdd(true);
    }
  }, [openDialog]);

  const cleanForm = () => {
    reset(defaultValues);
    setErrorMessage('');
  };

  const handleDialogCloseAdd = () => {
    setOpenDialogAdd(false);
    onCloseDialogAdd();
  };

  const compareData = (data: any) => {
    for (const i of currentData) {
      const validation = includesCode
        ? cleanString(i.name) === cleanString(data.name) ||
          cleanString(i.code) === cleanString(data.code)
        : cleanString(i.name) === cleanString(data.name);

      if (validation) {
        setErrorMessage('El item que está ingresando ya existe en la lista');
        setIsLoading(false);
        return;
      }
    }
  };

  const onSubmit = async (data: FieldValues) => {
    setIsLoading(true);
    setErrorMessage('');

    if (!includesCode) delete data.code;

    compareData(data);

    const listRq = sharedServices.saveList(data);

    listRq
      .then((res) => {
        setIsLoading(false);
        handleDialogCloseAdd();
        onDataSend(res);
      })
      .catch((error) => {
        if (error.response) setErrorMessage(error.response.data);
        else setErrorMessage('Se ha presentado un error. Intente nuevamente');
        setIsLoading(false);
      });
  };

  return (
    <ModalDialog
      maxWidth="md"
      isOpen={openDialogAdd}
      handleClose={handleDialogCloseAdd}
      title={'Agregar ' + label}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: includesCode ? 6 : 12 }}>
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

          {includesCode && (
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
          )}

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

          <Grid size={12}>
            <Button
              type="submit"
              variant="contained"
              color="inherit"
              fullWidth
              loading={isLoading}
              loadingPosition="start"
            >
              Agregar
            </Button>
          </Grid>
        </Grid>
      </form>
    </ModalDialog>
  );
}
