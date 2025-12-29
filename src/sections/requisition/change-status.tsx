import { z } from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FieldValues, useForm } from 'react-hook-form';

import { Alert, Box, Button, Grid, MenuItem, TextField, Typography } from '@mui/material';

import { _errors } from 'src/utils/input-errors';

import RequisitionService from 'src/services/requisition/requisition-service';

import { ModalDialog } from 'src/components/modal-dialog';

// ----------------------------------------------------------------------

interface Props {
  openAlert: boolean;
  action: string;
  PK: any;
  onCloseAlert: () => void;
  handleSavedElement: (response: any) => void;
}

export function ChangeStatus({ openAlert, action, PK, onCloseAlert, handleSavedElement }: Props) {
  const schema = z.object({
    PK: z.string().optional(),
    status: z.string().nonempty(_errors.required),
    observations: z.string().optional().or(z.literal('')),
  });

  const defaultValues = {
    PK: '',
    status: '',
    observations: '',
  };

  type FormData = z.infer<typeof schema>;

  const [openDialog, setOpenDialog] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

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
    if (openAlert) {
      cleanMessages();

      if (action === 'SEND') setModalTitle('Enviar para aprobación');
      else if (action === 'APPROVE') setModalTitle('Aprobar requisición');

      setOpenDialog(true);
    }
  }, [openAlert]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    onCloseAlert();
  };

  const cleanMessages = () => {
    setIsSavingData(false);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const onSubmit = async () => {
    setIsSavingData(true);
    cleanMessages();

    const query = { PK: PK, status: action === 'SEND' ? 'EnRevisión1' : '' };

    const changeStatusRq = RequisitionService.changeStatus(query);

    changeStatusRq
      .then((changeStatusRs) => {
        setSuccessMessage('Operación realizada con éxito');
        setIsSavingData(false);
        handleSavedElement(changeStatusRs.data);
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
      title={modalTitle}
      maxWidth="sm"
    >
      {action === 'SEND' && (
        <Typography sx={{ m: 0 }}>
          ¿Seguro(a) que desea enviar para aprobación la <b>Requisición #{PK.match(/\d+/)?.[0]}</b>?
          Después de enviado, el registro no podrá ser modificado.
        </Typography>
      )}

      {action === 'APPROVE' && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Estado *"
                    {...field}
                    error={Boolean(errors.status)}
                    helperText={errors.status && errors.status.message}
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    <MenuItem value="Aprobada">Aprobada</MenuItem>
                    <MenuItem value="Rechazada">Rechazada</MenuItem>
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
          </Grid>
        </form>
      )}

      {errorMessage !== '' && (
        <Alert
          severity="error"
          sx={{
            borderRadius: 1,
            width: 1,
            mb: 0,
            mt: 2,
          }}
        >
          {errorMessage}
        </Alert>
      )}

      {successMessage !== '' && (
        <Alert
          severity="success"
          sx={{
            borderRadius: 1,
            width: 1,
            mb: 0,
            mt: 2,
          }}
        >
          {successMessage}
        </Alert>
      )}

      <Box display="flex" justifyContent="flex-end" gap={3} sx={{ mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          color="inherit"
          disabled={isSavingData}
          onClick={handleDialogClose}
        >
          Cancelar
        </Button>
        <Button
          disabled={Boolean(successMessage)}
          variant="outlined"
          color="primary"
          loading={isSavingData}
          loadingPosition="start"
          onClick={onSubmit}
        >
          Enviar
        </Button>
      </Box>
    </ModalDialog>
  );
}
