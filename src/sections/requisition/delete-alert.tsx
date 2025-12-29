import { useEffect, useState } from 'react';

import { Alert, Box, Button, Typography } from '@mui/material';

import RequisitionService from 'src/services/requisition/requisition-service';

import { ModalDialog } from 'src/components/modal-dialog';

// ----------------------------------------------------------------------

interface Props {
  openAlert: boolean;
  action: string;
  element: any;
  onCloseAlert: () => void;
  handleDeletedElement: (response: any) => void;
}

export function DeleteAlert({
  openAlert,
  action,
  element,
  onCloseAlert,
  handleDeletedElement,
}: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const [isSavingData, setIsSavingData] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (openAlert) {
      cleanMessages();

      if (action === 'deleteItem') setModalTitle('item');

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

    const query = { data: { PK: element.PK, SK: element.SK } };

    const deleteRq = RequisitionService.deleteItem(query);

    deleteRq
      .then((deleteRs) => {
        setSuccessMessage('Operación realizada con éxito');
        setIsSavingData(false);
        handleDeletedElement(deleteRs.data);
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
      title={`Eliminar ${modalTitle}`}
      maxWidth="sm"
    >
      {element && (
        <Typography sx={{ m: 0 }}>
          ¿Seguro(a) que desea eliminar{' '}
          <b>{action === 'deleteItem' ? element.itemName : element.name}</b>? Esta acción es
          irreversible
        </Typography>
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
          color="error"
          loading={isSavingData}
          loadingPosition="start"
          onClick={onSubmit}
        >
          Eliminar
        </Button>
      </Box>
    </ModalDialog>
  );
}
