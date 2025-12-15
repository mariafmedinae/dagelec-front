import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import React, { useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';

import { RouterLink } from 'src/routes/components';
import { usePathname, useRouter } from 'src/routes/hooks';

import { getMenu } from 'src/utils/permissions-functions';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export type NavContentProps = {
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  sx?: SxProps<Theme>;
};

export function NavDesktop({
  sx,
  slots,
  layoutQuery,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        width: 'var(--layout-nav-vertical-width)',
        borderRight: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        ...sx,
      }}
    >
      <NavContent slots={slots} />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  open,
  slots,
  onClose,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      <NavContent slots={slots} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ slots, sx }: NavContentProps) {
  const pathname = usePathname();
  const router = useRouter();

  const permissions = getMenu();

  let currentCategoryMenu: any;

  const menuCategories = permissions.reduce((array: any, current: any) => {
    if (`/dashboard/${current.path}` === pathname) currentCategoryMenu = current.category;
    if (!array.includes(current.category)) array.push(current.category);
    return array;
  }, []);

  return (
    <>
      <Box sx={{ mb: 1, textAlign: 'center' }}>
        <Box component={RouterLink} href="/dashboard/">
          <img
            src={import.meta.env.VITE_BASE_URL + 'assets/imgs/dagelec.png'}
            style={{ maxHeight: 70, cursor: 'pointer' }}
          />
        </Box>
      </Box>

      {slots?.topArea}

      <Scrollbar fillContent>
        <Box
          component="nav"
          sx={[
            {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          {menuCategories.map((item: any, index: number) => (
            <Accordion
              disableGutters
              sx={{ backgroundColor: 'transparent' }}
              key={item}
              defaultExpanded={item === currentCategoryMenu}
            >
              <AccordionSummary
                expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
                aria-controls={'panel' + index + '-content'}
                id={'panel' + index + '-header'}
              >
                <Typography
                  component="span"
                  sx={[
                    (theme) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      typography: 'body2',
                      fontWeight: 'fontWeightMedium',
                      color: theme.vars.palette.text.secondary,
                    }),
                  ]}
                >
                  {item}
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 0 }}>
                <Box
                  component="ul"
                  sx={{
                    gap: 0.5,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {permissions.map((element: any) => {
                    const isActived = `/dashboard/${element.path}` === pathname;

                    return element.category === item ? (
                      <ListItem disableGutters disablePadding key={element.PK}>
                        <ListItemButton
                          disableGutters
                          component={RouterLink}
                          href={'/dashboard/' + element.path}
                          sx={[
                            (theme) => ({
                              pl: 2,
                              py: 1,
                              gap: 2,
                              pr: 1.5,
                              borderRadius: 0.75,
                              typography: 'body2',
                              fontWeight: 'fontWeightMedium',
                              color: theme.vars.palette.text.secondary,
                              minHeight: 44,
                              ...(isActived && {
                                fontWeight: 'fontWeightSemiBold',
                                color: theme.vars.palette.primary.main,
                                bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
                                '&:hover': {
                                  bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
                                },
                              }),
                            }),
                          ]}
                        >
                          <Box component="span" sx={{ width: 24, height: 24 }}>
                            <Iconify
                              icon={element.icon}
                              style={{ width: '24px', height: '24px' }}
                            />
                          </Box>

                          <Box component="span" sx={{ flexGrow: 1 }}>
                            {element.name}
                          </Box>
                        </ListItemButton>
                      </ListItem>
                    ) : null;
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Scrollbar>

      {slots?.bottomArea}

      <Box sx={{ my: 1 }}>
        <Typography variant="h3" sx={{ textAlign: 'center', color: '#0c6532' }}>
          DagelApp
        </Typography>
      </Box>
    </>
  );
}
