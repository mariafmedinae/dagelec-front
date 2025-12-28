import axios from 'axios';
import { useEffect, useState } from 'react';

import { Alert, Box, Button, Typography } from '@mui/material';

import { getFormPermissions, verifyPermission } from 'src/utils/permissions-functions';

import { DashboardContent } from 'src/layouts/dashboard';
import sharedServices from 'src/services/shared/shared-services';
import VendorService from 'src/services/vendor-registration/vendor-registration-service';

import { Iconify } from 'src/components/iconify';
import { Loading } from 'src/components/loading';

import { Form, ManageVendor, Search } from 'src/sections/vendor-registration';

// ----------------------------------------------------------------------

export function VendorRegistrationView() {
  const [loadLists, setLoadLists] = useState(true);

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [vendorsList, setVendorsList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [cityList, setCityList] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [formAction, setFormAction] = useState('');
  const [PK, setPK] = useState('');

  const [manageVendor, setManageVendor] = useState(false);
  const [managedVendorPK, setManagedVendorPK] = useState('');
  const [triggerManageVendor, setTriggerManageVendor] = useState(0);

  const [savedData, setSavedData] = useState();

  const formPK = 'VENDOR';
  const permissionsList = getFormPermissions(formPK);

  useEffect(() => {
    if (loadLists) {
      setIsLoading(true);
      setGlobalError(false);

      if (verifyPermission(permissionsList, formPK, 'SEARCH')) {
        const axiosRoutes = [
          sharedServices.getList({ entity: 'DEPARTMENT' }),
          sharedServices.getList({ entity: 'CITY' }),
          VendorService.getVendor({ all: 'ALL' }),
        ];

        axios
          .all(axiosRoutes)
          .then(
            axios.spread((departmentRs, cityRs, vendorRs) => {
              setDepartmentList(departmentRs.data);
              setCityList(cityRs.data);
              setVendorsList(vendorRs.data);
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

  const onManageVendor = (vendorId: string) => {
    setManagedVendorPK(vendorId);
    setTriggerManageVendor((prev) => prev + 1);
    setManageVendor(true);
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
          Registro proveedores
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
          Nuevo proveedor
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
            vendorList={vendorsList}
            departmentList={departmentList}
            cityList={cityList}
            savedData={savedData}
            handleUpdateAction={(data) => onUpdateForm(data)}
            handleManageAction={(data) => onManageVendor(data)}
            hideContactSection={() => {
              setManageVendor(false);
              setManagedVendorPK('');
            }}
          />

          {manageVendor && (
            <ManageVendor
              permissionsList={permissionsList}
              clickedManage={triggerManageVendor}
              managedVendorPK={managedVendorPK}
              savedVendorData={savedData}
            />
          )}
        </Box>
      )}
    </DashboardContent>
  );
}
