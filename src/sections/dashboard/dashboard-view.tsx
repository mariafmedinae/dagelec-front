import React from 'react';
import { useEffect, useState } from 'react';

import Typography from '@mui/material/Typography';
import { Box, Button, Card, CardActionArea, Grid } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { getMenu } from 'src/utils/permissions-functions';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Loading } from 'src/components/loading';

// ----------------------------------------------------------------------

export function DashboardView() {
  const router = useRouter();

  const permissions = getMenu();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [isLoading]);

  return (
    <DashboardContent maxWidth={false}>
      {isLoading && <Loading />}

      {!isLoading && (
        <>
          <Typography
            variant="h5"
            sx={{
              mb: { xs: 3, md: 5 },
              width: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            <img
              src={import.meta.env.VITE_BASE_URL + 'assets/imgs/dagelec.png'}
              alt="Dagelec Logo"
              style={{ width: '200px' }}
            />
            Bienvenido(a) al sistema de gestión de Dagelec
          </Typography>

          <Grid container spacing={2} alignItems="stretch">
            {permissions.map((item: any, index: number) => {
              let showTitle = false;
              if (index === 0 || permissions[index - 1].category !== item.category)
                showTitle = true;

              return (
                <React.Fragment key={item.PK}>
                  {showTitle && (
                    <Grid size={12}>
                      <Typography
                        variant="h5"
                        sx={{
                          textAlign: 'center',
                          backgroundColor: '#0b7034',
                          color: '#fff',
                          borderRadius: '20px',
                          padding: '3px',
                        }}
                      >
                        {item.category}
                      </Typography>
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                    <Card
                      sx={{
                        backgroundColor: '#f5f5f5',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.04)',
                          cursor: 'pointer',
                        },
                      }}
                    >
                      <CardActionArea
                        onClick={() => router.push(`/dashboard/${item.path}`)}
                        sx={{
                          display: 'flex',
                          alignItems: 'start',
                          padding: 2,
                        }}
                        style={{ height: '100px' }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            flex: '0 0 50px',
                            marginRight: 1,
                          }}
                        >
                          <Iconify width="50px" color="#0b7034" icon={item.icon} />
                        </Box>
                        <Box sx={{ flex: '1' }}>
                          <Typography variant="subtitle1">{item.name}</Typography>
                          <Typography variant="body2">{item.description}</Typography>
                        </Box>
                      </CardActionArea>
                    </Card>
                  </Grid>
                </React.Fragment>
              );
            })}
          </Grid>
        </>
      )}
    </DashboardContent>
  );
}
