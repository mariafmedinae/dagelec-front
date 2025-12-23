import { useEffect, useState } from 'react';

import { Alert, Box, Button, Typography } from '@mui/material';

import { getFormPermissions, verifyPermission } from 'src/utils/permissions-functions';

import { DashboardContent } from 'src/layouts/dashboard';
import sharedServices from 'src/services/shared/shared-services';

import { Iconify } from 'src/components/iconify';
import { Loading } from 'src/components/loading';

import { Form, Search } from 'src/sections/item-coding';

// ----------------------------------------------------------------------

export function ItemCodingView() {
  const [loadLists, setLoadLists] = useState(true);

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [groupList, setGroupList] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [formAction, setFormAction] = useState('');
  const [PK, setPK] = useState('');

  const [savedData, setSavedData] = useState();

  const formPK = 'ITEM';
  const permissionsList = getFormPermissions(formPK);

  useEffect(() => {
    if (loadLists) {
      setIsLoading(true);
      setGlobalError(false);

      if (verifyPermission(permissionsList, formPK, 'SEARCH')) {
        const groupRq = sharedServices.getList({ entity: 'GROUP' });

        groupRq
          .then((res) => {
            setGroupList(res.data);
            setIsLoading(false);
            setGlobalError(false);
            setTimeout(() => setLoadLists(false), 500);
          })
          .catch((error) => {
            setIsLoading(false);
            setGlobalError(true);
          });
      } else setTimeout(() => setIsLoading(false), 500);
    }
  }, [loadLists]);

  const onOpenForm = () => {
    setFormAction('create');
    setOpenForm(true);
  };

  const onUpdateForm = (itemId: string) => {
    setFormAction('update');
    setPK(itemId);
    setOpenForm(true);
  };

  return (
    <DashboardContent maxWidth={false}>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          flexFlow: {
            xs: 'column',
            sm: 'row',
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            flexGrow: 1,
            textAlign: {
              xs: 'center',
              sm: 'left',
            },
          }}
        >
          Codificación productos y servicios
        </Typography>
        <Button
          sx={{
            display: verifyPermission(permissionsList, formPK, 'CREATE') ? 'inline-flex' : 'none',
          }}
          disabled={isLoading || globalError}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={onOpenForm}
        >
          Nuevo producto o servicio
        </Button>
      </Box>

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

      {openForm && (
        <Form
          openForm={openForm}
          action={formAction}
          PK={PK}
          onCloseForm={() => {
            setLoadLists(true);
            setPK('');
            setOpenForm(false);
          }}
          handleSavedData={(data) => setSavedData(data)}
        />
      )}

      {verifyPermission(permissionsList, formPK, 'SEARCH') && (
        <Box sx={{ display: !isLoading && !globalError ? 'block' : 'none' }}>
          <Search
            formPK={formPK}
            permissionsList={permissionsList}
            groupList={groupList}
            savedData={savedData}
            handleUpdateAction={(data) => onUpdateForm(data)}
          />
        </Box>
      )}
    </DashboardContent>
  );
}
