import axios from 'axios';
import { useEffect, useState } from 'react';

import { Alert, Box } from '@mui/material';

import IngredientService from 'src/services/ingredient-coding/ingredient-coding-service';

import { Loading } from 'src/components/loading';
import { ModalDialog } from 'src/components/modal-dialog';

// ----------------------------------------------------------------------

interface Props {
  openInfo: boolean;
  element: any;
  onCloseInfo: () => void;
}

export function IngredientInfo({ openInfo, element, onCloseInfo }: Props) {
  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  const [infoData, setInfoData] = useState<any>();

  useEffect(() => {
    if (openInfo) {
      setIsLoading(true);
      setGlobalError(false);

      setOpenDialog(true);

      const fetchData = async () => {
        const axiosRoutes = [IngredientService.getIngredient({ PK: element.PK, action: 'UPDATE' })];

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((infoRs) => {
              setInfoData(infoRs.data);
              setIsLoading(false);
            })
          )
          .catch((error) => {
            setIsLoading(false);
            setGlobalError(true);
          });
      };

      fetchData();
    }
  }, [openInfo]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    onCloseInfo();
  };

  return (
    <ModalDialog
      isOpen={openDialog}
      handleClose={handleDialogClose}
      title={element.name}
      maxWidth="sm"
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

      {!isLoading && !globalError && infoData && (
        <>
          {infoData.getUrl && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <img src={infoData.getUrl} style={{ maxHeight: '150px' }} />
            </Box>
          )}
        </>
      )}
    </ModalDialog>
  );
}
