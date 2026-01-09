import axios from 'axios';
import { useEffect, useState } from 'react';

import { Alert, Box, Button, Typography } from '@mui/material';

import { getFormPermissions, verifyPermission } from 'src/utils/permissions-functions';

import { DashboardContent } from 'src/layouts/dashboard';
import sharedServices from 'src/services/shared/shared-services';
import ItemService from 'src/services/item-coding/item-coding-service';

import { Iconify } from 'src/components/iconify';
import { Loading } from 'src/components/loading';

import { Form, Search } from 'src/sections/inventory';

// ----------------------------------------------------------------------

export function InventoryView() {
  const [loadLists, setLoadLists] = useState(true);

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [storeList, setStoreList] = useState([]);
  const [itemList, setItemList] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [formAction, setFormAction] = useState('');

  const formPK = 'INVENTORY';
  const permissionsList = getFormPermissions(formPK);

  useEffect(() => {
    if (loadLists) {
      setIsLoading(true);
      setGlobalError(false);

      if (verifyPermission(permissionsList, formPK, 'SEARCH')) {
        const fetchData = async () => {
          const axiosRoutes = [
            ItemService.getItem({ all: 'ALL' }),
            sharedServices.getList({ entity: 'STORE' }),
          ];

          axios
            .all(axiosRoutes)
            .then(
              axios.spread((itemRs, storeRs, inventoryRs) => {
                setItemList(itemRs.data);
                setStoreList(storeRs.data);

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
          Inventario
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
          Nuevo item
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
          onCloseForm={() => {
            setLoadLists(true);
            setOpenForm(false);
          }}
        />
      )}

      {verifyPermission(permissionsList, formPK, 'SEARCH') && (
        <Box sx={{ display: !isLoading && !globalError ? 'block' : 'none' }}>
          <Search
            formPK={formPK}
            permissionsList={permissionsList}
            itemList={itemList}
            storeList={storeList}
          />
        </Box>
      )}
    </DashboardContent>
  );
}
