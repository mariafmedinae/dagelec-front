import { useEffect, useRef, useState } from 'react';

import { Alert, Box, Card, CardContent, Typography } from '@mui/material';

import VendorService from 'src/services/vendor-registration/vendor-registration-service';

import { Loading } from 'src/components/loading';
import DynamicTabs from 'src/components/tabs/dynamic-tabs';

import { Contacts } from './contacts';
import { References } from './references';

// ----------------------------------------------------------------------

interface Props {
  permissionsList: any;
  clickedManage: any;
  managedVendorPK: string;
  savedVendorData: any;
}

export function ManageVendor({
  permissionsList,
  clickedManage,
  managedVendorPK,
  savedVendorData,
}: Props) {
  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchHeader, setSearchHeader] = useState<any>({ name: '' });
  const [searchResult, setSearchResult] = useState<any>();

  const [vendorPK, setVendorPK] = useState('');

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const tabsData = [
    {
      label: 'Contactos',
      content: (
        <Contacts
          permissionsList={permissionsList}
          data={searchResult?.contacts || []}
          vendorPK={vendorPK}
        />
      ),
    },
    {
      label: 'Referencias',
      content: (
        <References
          permissionsList={permissionsList}
          data={searchResult?.references || []}
          vendorPK={vendorPK}
        />
      ),
    },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [clickedManage]);

  useEffect(() => {
    setIsLoading(true);
    setGlobalError(false);

    const enterpriseRq = VendorService.getVendor({
      PK: managedVendorPK,
      action: 'MANAGE',
      type: 'C',
    });

    enterpriseRq
      .then((res) => {
        setSearchHeader(res.data.vendor);
        setSearchResult(res.data);
        setVendorPK(managedVendorPK);
        setIsLoading(false);
      })
      .catch((error) => {
        setGlobalError(true);
        setIsLoading(false);
      });
  }, [managedVendorPK]);

  useEffect(() => {
    if (savedVendorData) {
      if (savedVendorData.PK === managedVendorPK) setSearchHeader(savedVendorData);
    }
  }, [savedVendorData]);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      window.scrollTo({
        top: bottomRef.current.offsetTop,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Box sx={{ mt: 5 }}>
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

      <div ref={bottomRef} />

      {!isLoading && !globalError && (
        <>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexFlow: {
                    xs: 'column',
                    sm: 'row',
                  },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    flexGrow: 1,
                    textAlign: {
                      xs: 'center',
                      sm: 'left',
                    },
                  }}
                >
                  {searchHeader.name}
                </Typography>
              </Box>
            </CardContent>

            <DynamicTabs tabs={tabsData} />
          </Card>
        </>
      )}
    </Box>
  );
}
