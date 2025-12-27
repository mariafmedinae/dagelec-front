import { useEffect, useRef, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  Typography,
} from '@mui/material';

import { getActionsList, verifyPermission } from 'src/utils/permissions-functions';

import VendorService from 'src/services/vendor-registration/vendor-registration-service';

import { Iconify } from 'src/components/iconify';
import { Loading } from 'src/components/loading';
import { Scrollbar } from 'src/components/scrollbar';
import {
  applyFilter,
  DataTableHead,
  DataTableRow,
  DataTableToolbar,
  getComparator,
  useTable,
} from 'src/components/data-table';

import { ContactForm } from './contact-form';

// ----------------------------------------------------------------------

interface Props {
  permissionsList: any;
  clickedManage: any;
  managedClientPK: string;
  savedClientData: any;
}

export function Contacts({
  permissionsList,
  clickedManage,
  managedClientPK,
  savedClientData,
}: Props) {
  type ContactProps = {
    PK: string;
    SK: string;
    name: string;
    positionName: string;
    email: string;
  };

  const headLabel = [
    { id: '', label: '' },
    { id: 'name', label: 'Nombre' },
    { id: 'positionName', label: 'Cargo' },
    { id: 'email', label: 'Email' },
  ];

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchHeader, setSearchHeader] = useState<any>({ name: '' });
  const [searchResult, setSearchResult] = useState<ContactProps[]>([]);

  const [openForm, setOpenForm] = useState(false);
  const [formAction, setFormAction] = useState('');
  const [entresprisePK, setEntresprisePK] = useState('');
  const [contact, setContact] = useState('');

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [savedData, setSavedData] = useState<any>();

  const formPK = 'CONTACT';

  const tableActions = getActionsList(permissionsList, formPK);

  const table = useTable();

  const [filterName, setFilterName] = useState('');

  const dataFiltered: ContactProps[] = applyFilter({
    inputData: searchResult,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    headLabel,
  });

  useEffect(() => {
    scrollToBottom();
  }, [clickedManage]);

  useEffect(() => {
    setIsLoading(true);
    setGlobalError(false);

    const enterpriseRq = VendorService.getVendor({
      PK: managedClientPK,
      action: 'MANAGE',
      type: 'C',
    });

    enterpriseRq
      .then((res) => {
        setSearchHeader(res.data.enterprise);
        setSearchResult(Array.isArray(res.data.contacts) ? res.data.contacts : [res.data.contacts]);
        setEntresprisePK(managedClientPK);
        setIsLoading(false);
      })
      .catch((error) => {
        setGlobalError(true);
        setIsLoading(false);
      });
  }, [managedClientPK]);

  useEffect(() => {
    if (savedClientData) {
      if (savedClientData.PK === managedClientPK) setSearchHeader(savedClientData);
    }
  }, [savedClientData]);

  useEffect(() => {
    if (savedData) {
      const index = searchResult.findIndex((item: any) => item.SK === savedData.SK);

      if (index !== -1) searchResult[index] = savedData;
      else {
        setSearchResult([savedData, ...searchResult]);
      }

      table.onSort('noColumn');
      setFilterName('');
    }
  }, [savedData]);

  const onOpenForm = () => {
    setFormAction('create');
    setOpenForm(true);
  };

  const handleUpdateAction = (contactRow: any) => {
    setFormAction('update');
    setContact(contactRow);
    setOpenForm(true);
  };

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
                  mb: 2,
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
                <Button
                  sx={{
                    display: verifyPermission(permissionsList, formPK, 'CREATE')
                      ? 'inline-flex'
                      : 'none',
                  }}
                  disabled={isLoading || globalError}
                  variant="contained"
                  color="inherit"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={onOpenForm}
                >
                  Nuevo contacto
                </Button>
              </Box>
            </CardContent>

            {searchResult.length === 0 && (
              <Typography variant="subtitle2" textAlign="center" sx={{ mb: 3 }}>
                No hay contactos para mostrar
              </Typography>
            )}

            {searchResult.length > 0 && (
              <>
                <DataTableToolbar
                  filterName={filterName}
                  onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setFilterName(event.target.value);
                    table.onResetPage();
                  }}
                />

                <Scrollbar>
                  <TableContainer sx={{ overflow: 'unset' }}>
                    <Table sx={{ minWidth: 800 }}>
                      <DataTableHead
                        order={table.order}
                        orderBy={table.orderBy}
                        rowCount={searchResult.length}
                        onSort={table.onSort}
                        headLabel={headLabel}
                      />
                      <TableBody>
                        {dataFiltered
                          .slice(
                            table.page * table.rowsPerPage,
                            table.page * table.rowsPerPage + table.rowsPerPage
                          )
                          .map((row) => (
                            <DataTableRow
                              key={row.SK}
                              row={row}
                              headLabel={headLabel}
                              tableActions={tableActions}
                              onUpdateAction={() => handleUpdateAction(row)}
                            />
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Scrollbar>

                <TablePagination
                  component="div"
                  page={table.page}
                  count={searchResult.length}
                  rowsPerPage={table.rowsPerPage}
                  onPageChange={table.onChangePage}
                  rowsPerPageOptions={[5, 10]}
                  onRowsPerPageChange={table.onChangeRowsPerPage}
                  labelRowsPerPage="Filas por página"
                />
              </>
            )}
          </Card>
        </>
      )}

      {openForm && (
        <ContactForm
          openForm={openForm}
          action={formAction}
          enterprisePK={entresprisePK}
          contact={contact}
          onCloseForm={() => {
            setContact('');
            setOpenForm(false);
          }}
          handleSavedData={(data) => setSavedData(data)}
        />
      )}
    </Box>
  );
}
