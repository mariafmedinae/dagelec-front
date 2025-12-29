import axios from 'axios';
import { useEffect, useState } from 'react';

import { Alert, Box, Button, Typography } from '@mui/material';

import { getFormPermissions, verifyPermission } from 'src/utils/permissions-functions';

import { DashboardContent } from 'src/layouts/dashboard';
import sharedServices from 'src/services/shared/shared-services';
import PersonalService from 'src/services/personal-registration/personal-registration-service';

import { Iconify } from 'src/components/iconify';
import { Loading } from 'src/components/loading';

import { Form, Items, Search } from 'src/sections/requisition';

// ----------------------------------------------------------------------

export function RequisitionView() {
  const [loadLists, setLoadLists] = useState(true);

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [applicantList, setApplicantList] = useState([]);
  const [costCenterList, setCostCenterList] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [formAction, setFormAction] = useState('');
  const [PK, setPK] = useState('');

  const [manageItem, setManageItem] = useState(false);
  const [managedPK, setManagedPK] = useState('');
  const [triggerManage, setTriggerManage] = useState(0);

  const [savedData, setSavedData] = useState();

  const formPK = 'REQUISITION';
  const permissionsList = getFormPermissions(formPK);

  useEffect(() => {
    if (loadLists) {
      setIsLoading(true);
      setGlobalError(false);

      if (verifyPermission(permissionsList, formPK, 'SEARCH')) {
        const fetchData = async () => {
          const axiosRoutes = [
            PersonalService.getUser({ all: 'ALL' }),
            sharedServices.getList({ entity: 'COST' }),
          ];

          axios
            .all(axiosRoutes)
            .then(
              axios.spread((applicantRs, costCenterRs) => {
                setApplicantList(applicantRs.data);
                setCostCenterList(costCenterRs.data);
                setIsLoading(false);
                setGlobalError(false);
                setTimeout(() => setLoadLists(false), 500);
              })
            )
            .catch((error) => {
              setIsLoading(false);
              setGlobalError(true);
            });
        };

        fetchData();
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

  const onManage = (Id: string) => {
    setManagedPK(Id);
    setTriggerManage((prev) => prev + 1);
    setManageItem(true);
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
          Requisiciones
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
          Nueva requisición
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
            applicantList={applicantList}
            costCenterList={costCenterList}
            savedData={savedData}
            handleUpdateAction={(data) => onUpdateForm(data)}
            handleManageAction={(data) => onManage(data)}
            hideItemSection={() => {
              setManagedPK('');
              setManageItem(false);
            }}
          />

          {manageItem && (
            <Items
              permissionsList={permissionsList}
              clickedManage={triggerManage}
              managedPK={managedPK}
              savedRequisitionData={savedData}
            />
          )}
        </Box>
      )}
    </DashboardContent>
  );
}
