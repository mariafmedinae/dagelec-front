import { useEffect, useState } from 'react';

import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';

import { getActionsList, verifyPermission } from 'src/utils/permissions-functions';

import sharedServices from 'src/services/shared/shared-services';
import PersonalService from 'src/services/personal-registration/personal-registration-service';

import { Inform } from 'src/components/pdf';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  applyFilter,
  DataTableHead,
  DataTableRow,
  DataTableToolbar,
  getComparator,
  useTable,
} from 'src/components/data-table';

// ----------------------------------------------------------------------

interface Props {
  formPK: string;
  permissionsList: any;
  usersList: any;
  savedData: any;
  handleUpdateAction: (PK: string) => void;
}

export function Search({
  formPK,
  permissionsList,
  usersList,
  savedData,
  handleUpdateAction,
}: Props) {
  type UserProps = {
    PK: string;
    name: string;
    positionName: string;
    status: string;
  };

  const headLabel = [
    { id: '', label: '' },
    { id: 'name', label: 'Nombre' },
    { id: 'positionName', label: 'Cargo' },
    { id: 'status', label: 'Estado' },
  ];

  const filesTitle = 'Informe Registro de Personal';
  const filesHeaders = ['Nombre', 'Cédula', 'Celular', 'Email', 'Cargo'];
  const pdfColsWidth = ['20%', '20%', '20%', '20%', '20%'];
  let filesData;

  const [selectedUser, setSelectedUser] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [requestType, setRequestType] = useState('');
  const [searchResult, setSearchResult] = useState<UserProps[]>([]);

  const tableActions = getActionsList(permissionsList, formPK);

  const table = useTable();

  const [filterName, setFilterName] = useState('');

  const dataFiltered: UserProps[] = applyFilter({
    inputData: searchResult,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    headLabel,
  });

  useEffect(() => {
    if (savedData) {
      setErrorMessage('');

      let validation;

      if (selectedStatus) validation = savedData.status === selectedStatus;
      else if (selectedUser) validation = savedData.PK === selectedUser;

      if (validation) {
        const index = searchResult.findIndex((item) => item.PK === savedData.PK);

        if (index !== -1) searchResult[index] = savedData;
        else {
          setSearchResult([savedData, ...searchResult]);
        }
      } else {
        setSelectedStatus('');
        setSelectedUser('');
        setSearchResult([savedData]);
      }

      resertTableFilters();
    }
  }, [savedData]);

  useEffect(() => {
    if (requestType && isLoading) {
      const query: Record<string, string> = {};
      if (selectedUser) query.PK = selectedUser;
      if (selectedStatus) query.status = selectedStatus;
      query.action = requestType === 'search' ? 'SEARCH' : 'INFORM';

      const userRq = PersonalService.getUser(query);

      userRq
        .then((res) => {
          if (res.data.length === 0) {
            setErrorMessage(
              'No se encontraron resultados' +
                (requestType === 'search' ? '.' : ' para generar el informe.')
            );
            setIsLoading(false);
            if (requestType === 'search') setSearchResult([]);
            return;
          }
          if (requestType === 'search') {
            setSearchResult(Array.isArray(res.data) ? res.data : [res.data]);
            resertTableFilters();
          } else if (requestType === 'PDF') {
            const data = Array.isArray(res.data) ? res.data : [res.data];

            filesData = data.map((item) => [
              item.name,
              item.documentId,
              item.cellphone,
              item.email,
              item.positionName,
            ]);

            sharedServices.exportPdf(
              <Inform
                title={filesTitle}
                headers={filesHeaders}
                data={filesData}
                colsWidth={pdfColsWidth}
              />
            );
          } else {
            const data = Array.isArray(res.data) ? res.data : [res.data];

            const columns = [
              { header: 'Nombre', key: 'name', width: 30 },
              { header: 'Cédula', key: 'documentId', width: 30 },
              { header: 'Celular', key: 'cellphone', width: 30 },
              { header: 'Email', key: 'email', width: 30 },
              { header: 'Cargo', key: 'positionName', width: 30 },
            ];

            sharedServices.exportExcel(filesTitle, columns, data);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          setErrorMessage('Se presentó un error. Intente nuevamente.');
          setIsLoading(false);
          setSearchResult([]);
        });
    }
  }, [isLoading]);

  const handleSearch = (request: string) => {
    setIsLoading(true);
    setErrorMessage('');

    if (!selectedUser && !selectedStatus) {
      setErrorMessage('Debe de ingresar al menos un criterio de búsqueda.');
      setIsLoading(false);
      return;
    }

    setRequestType(request);
  };

  const resertTableFilters = () => {
    table.onSort('noColumn');
    table.onResetPage();
    setFilterName('');
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Buscar
          </Typography>
          <form>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  defaultValue=""
                  disabled={selectedStatus !== ''}
                  select
                  fullWidth
                  size="small"
                  label="Usuario"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {usersList.map((user: any) => (
                    <MenuItem key={user.PK} value={user.PK}>
                      {user.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  defaultValue=""
                  disabled={selectedUser !== ''}
                  select
                  fullWidth
                  size="small"
                  label="Estado"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  <MenuItem value="ACTIVE">Activo</MenuItem>
                  <MenuItem value="INACTIVE">Inactivo</MenuItem>
                </TextField>
              </Grid>

              {errorMessage !== '' && (
                <Grid size={12}>
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 1,
                      width: 1,
                      mb: 0,
                    }}
                  >
                    {errorMessage}
                  </Alert>
                </Grid>
              )}

              <Grid
                size={{ xs: 12, sm: verifyPermission(permissionsList, formPK, 'INFORM') ? 4 : 12 }}
              >
                <Button
                  variant="contained"
                  color="inherit"
                  disabled={isLoading}
                  loading={isLoading && requestType === 'search'}
                  loadingPosition="start"
                  fullWidth
                  onClick={() => handleSearch('search')}
                >
                  <Iconify icon="eva:search-fill" sx={{ mr: 1 }} />
                  Buscar
                </Button>
              </Grid>

              {verifyPermission(permissionsList, formPK, 'INFORM') && (
                <>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Button
                      sx={{ height: '100%' }}
                      disabled={selectedUser !== '' || isLoading}
                      variant="outlined"
                      color="error"
                      loading={isLoading && requestType === 'PDF'}
                      loadingPosition="start"
                      fullWidth
                      onClick={() => handleSearch('PDF')}
                    >
                      <Iconify icon="mingcute:pdf-fill" sx={{ mr: 1 }} />
                      Informe PDF
                    </Button>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Button
                      disabled={selectedUser !== '' || isLoading}
                      variant="outlined"
                      color="success"
                      loading={isLoading && requestType === 'EXCEL'}
                      loadingPosition="start"
                      fullWidth
                      onClick={() => handleSearch('EXCEL')}
                    >
                      <Iconify icon="ri:file-excel-2-fill" sx={{ mr: 1 }} />
                      Informe Excel
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </form>
        </CardContent>

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
                          key={row.PK}
                          row={row}
                          headLabel={headLabel}
                          tableActions={tableActions}
                          onUpdateAction={() => handleUpdateAction(row.PK)}
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
  );
}
