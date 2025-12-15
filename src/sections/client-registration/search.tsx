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

import { useSelectedClient } from 'src/context/selected-client';
import sharedServices from 'src/services/shared/shared-services';
import ClientService from 'src/services/client-registration/client-registration-service';

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
  clientsList: any;
  countryList: any;
  cityList: any;
  sectorList: any;
  savedData: any;
  handleUpdateAction: (PK: string) => void;
  handleManageAction: (PK: string) => void;
  hideContactSection: () => void;
}

export function Search({
  formPK,
  permissionsList,
  clientsList,
  countryList,
  cityList,
  sectorList,
  savedData,
  handleUpdateAction,
  handleManageAction,
  hideContactSection,
}: Props) {
  type ClientProps = {
    PK: string;
    name: string;
    numberId: string;
    phone: string;
    cityName: string;
  };

  const headLabel = [
    { id: '', label: '' },
    { id: 'name', label: 'Nombre' },
    { id: 'numberId', label: 'Nit/Cédula' },
    { id: 'phone', label: 'Teléfono' },
    { id: 'cityName', label: 'Ciudad' },
  ];

  const filesTitle = 'Informe Registro Cliente';
  const filesHeaders = [
    'Persona',
    'Nombre/Razón social',
    'Identificación',
    'País',
    'Ciudad',
    'Dirección',
    'Teléfono',
    'Email',
    'Web',
  ];
  const pdfColsWidth = ['10%', '13%', '10%', '10%', '10%', '10%', '10%', '12%', '15%'];
  let filesData;

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [numberId, setNumberId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [requestType, setRequestType] = useState('');
  const [searchResult, setSearchResult] = useState<ClientProps[]>([]);

  const { setSelectedClient } = useSelectedClient();

  const tableActions = getActionsList(permissionsList, formPK);

  const table = useTable();

  const [filterName, setFilterName] = useState('');

  const dataFiltered: ClientProps[] = applyFilter({
    inputData: searchResult,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    headLabel,
  });

  useEffect(() => {
    if (savedData) {
      setErrorMessage('');

      let validation;

      if (selectedCountry && selectedCity && selectedSector)
        validation =
          savedData.country === selectedCountry &&
          savedData.city === selectedCity &&
          savedData.sector === selectedSector;
      if (selectedCountry && selectedCity)
        validation = savedData.country === selectedCountry && savedData.city === selectedCity;
      if (selectedCountry && selectedSector)
        validation = savedData.country === selectedCountry && savedData.sector === selectedSector;
      if (selectedCity && selectedSector)
        validation = savedData.city === selectedCity && savedData.sector === selectedSector;
      else if (numberId) validation = savedData.numberId === numberId;
      else if (selectedCountry) validation = savedData.country === selectedCountry;
      else if (selectedCity) validation = savedData.city === selectedCity;
      else if (selectedSector) validation = savedData.sector === selectedSector;
      else if (
        localStorage.getItem('selectedClient') !== '' ||
        localStorage.getItem('selectedClient') !== null
      )
        validation = savedData.PK === localStorage.getItem('selectedClient')!;

      if (validation) {
        const index = searchResult.findIndex((item) => item.PK === savedData.PK);

        if (index !== -1) searchResult[index] = savedData;
        else {
          setSearchResult([savedData, ...searchResult]);
        }
      } else {
        setSelectedClient(savedData.client);
        localStorage.setItem('selectedClient', savedData.client);
        setSelectedCountry('');
        setSelectedCity('');
        setSelectedSector('');
        setNumberId('');
        setSearchResult([savedData]);
      }

      resertTableFilters();
    }
  }, [savedData]);

  useEffect(() => {
    if (requestType && isLoading) {
      const query: Record<string, string> = {};
      if (numberId || selectedCountry || selectedCity || selectedSector) {
        if (numberId) query.numberId = numberId;
        if (selectedCountry) query.country = selectedCountry;
        if (selectedCity) query.city = selectedCity;
        if (selectedSector) query.sector = selectedSector;
      } else {
        if (
          localStorage.getItem('selectedClient') !== '' ||
          localStorage.getItem('selectedClient') !== null
        )
          query.PK = localStorage.getItem('selectedClient')!;
      }

      query.action = requestType === 'search' ? 'SEARCH' : 'INFORM';

      const clientRq = ClientService.getClient(query);

      clientRq
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
              item.typePerson,
              item.name,
              `${item.typeId} ${item.numberId}${item.dv ? '-' + item.dv : ''}`,
              item.countryName,
              item.cityName,
              item.address,
              item.phone,
              item.email || '',
              item.web || '',
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
              { header: 'Persona', key: 'typePerson', width: 30 },
              { header: 'Nombre/Razón social', key: 'name', width: 30 },
              { header: 'Tipo identificación', key: 'typeId', width: 30 },
              { header: 'Número', key: 'numberId', width: 30 },
              { header: 'DV', key: 'dv', width: 30 },
              { header: 'País', key: 'countryName', width: 30 },
              { header: 'Ciudad', key: 'cityName', width: 30 },
              { header: 'Dirección', key: 'address', width: 30 },
              { header: 'Teléfono', key: 'phone', width: 30 },
              { header: 'Email', key: 'email', width: 30 },
              { header: 'Web', key: 'web', width: 30 },
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
    hideContactSection();

    if (
      (localStorage.getItem('selectedClient') === '' ||
        localStorage.getItem('selectedClient') === null) &&
      !numberId &&
      !selectedCountry &&
      !selectedCity &&
      !selectedSector
    ) {
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
                  disabled={selectedCity !== '' || selectedCountry !== '' || selectedSector !== ''}
                  fullWidth
                  size="small"
                  label="Nit/Cédula sin DV"
                  value={numberId}
                  onChange={(e) => setNumberId(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  defaultValue=""
                  disabled={numberId !== ''}
                  select
                  fullWidth
                  size="small"
                  label="País"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {countryList.map((user: any) => (
                    <MenuItem key={user.PK} value={user.PK}>
                      {user.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  defaultValue=""
                  disabled={numberId !== ''}
                  select
                  fullWidth
                  size="small"
                  label="Ciudad"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {cityList.map((user: any) => (
                    <MenuItem key={user.PK} value={user.PK}>
                      {user.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  defaultValue=""
                  disabled={numberId !== ''}
                  select
                  fullWidth
                  size="small"
                  label="Sector"
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {sectorList.map((user: any) => (
                    <MenuItem key={user.PK} value={user.PK}>
                      {user.name}
                    </MenuItem>
                  ))}
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
                      disabled={numberId !== '' || isLoading}
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
                      disabled={numberId !== '' || isLoading}
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
                          onManageAction={() => handleManageAction(row.PK)}
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
