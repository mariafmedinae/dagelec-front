import axios from 'axios';
import { useEffect, useState } from 'react';

import { Alert, Box, Button, Typography } from '@mui/material';

import { getFormPermissions, verifyPermission } from 'src/utils/permissions-functions';

import { DashboardContent } from 'src/layouts/dashboard';
import sharedServices from 'src/services/shared/shared-services';
import ClientService from 'src/services/client-registration/client-registration-service';

import { Iconify } from 'src/components/iconify';
import { Loading } from 'src/components/loading';

import { Contacts, Form, Search } from 'src/sections/client-registration';

// ----------------------------------------------------------------------

export function ClientRegistrationView() {
  const [loadLists, setLoadLists] = useState(true);

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [clientsList, setClientsList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [sectorList, setSectorList] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [formAction, setFormAction] = useState('');
  const [PK, setPK] = useState('');

  const [manageContacts, setManageContacts] = useState(false);
  const [managedClientPK, setManagedClientPK] = useState('');
  const [triggerManageClient, setTriggerManageClient] = useState(0);

  const [savedData, setSavedData] = useState();

  const formPK = 'ENTERPRISE';
  const permissionsList = getFormPermissions(formPK);

  useEffect(() => {
    if (loadLists) {
      setIsLoading(true);
      setGlobalError(false);

      if (verifyPermission(permissionsList, formPK, 'SEARCH')) {
        const axiosRoutes = [
          sharedServices.getList({ entity: 'COUNTRY' }),
          sharedServices.getList({ entity: 'CITY' }),
          sharedServices.getList({ entity: 'SECTOR' }),
          ClientService.getClient({ all: 'ALL' }),
        ];

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((countryRs, cityRs, sectorRs, clientRs) => {
              setCountryList(countryRs.data);
              setCityList(cityRs.data);
              setSectorList(sectorRs.data);
              setClientsList(clientRs.data);
              setIsLoading(false);
              setGlobalError(false);
              setTimeout(() => setLoadLists(false), 500);
            })
          )
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

  const onUpdateForm = (userId: string) => {
    setFormAction('update');
    setPK(userId);
    setOpenForm(true);
  };

  const onManageContacts = (clientId: string) => {
    setManagedClientPK(clientId);
    setTriggerManageClient((prev) => prev + 1);
    setManageContacts(true);
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
          Registro cliente
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
          Nuevo cliente
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
            clientsList={clientsList}
            countryList={countryList}
            cityList={cityList}
            sectorList={sectorList}
            savedData={savedData}
            handleUpdateAction={(data) => onUpdateForm(data)}
            handleManageAction={(data) => onManageContacts(data)}
            hideContactSection={() => {
              setManageContacts(false);
              setManagedClientPK('');
            }}
          />

          {manageContacts && (
            <Contacts
              permissionsList={permissionsList}
              clickedManage={triggerManageClient}
              managedClientPK={managedClientPK}
              savedClientData={savedData}
            />
          )}
        </Box>
      )}
    </DashboardContent>
  );
}
