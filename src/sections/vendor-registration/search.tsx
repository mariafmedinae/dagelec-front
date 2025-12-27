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
import VendorService from 'src/services/vendor-registration/vendor-registration-service';

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
  vendorList: any;
  departmentList: any;
  cityList: any;
  savedData: any;
  handleUpdateAction: (PK: string) => void;
  handleManageAction: (PK: string) => void;
  hideContactSection: () => void;
}

export function Search({
  formPK,
  permissionsList,
  vendorList,
  departmentList,
  cityList,
  savedData,
  handleUpdateAction,
  handleManageAction,
  hideContactSection,
}: Props) {
  type VendorProps = {
    PK: string;
    name: string;
    typeActivity: string;
    city: string;
    phone: string;
  };

  const headLabel = [
    { id: '', label: '' },
    { id: 'name', label: 'Nombre' },
    { id: 'typeActivity', label: 'NIT' },
    { id: 'cityName', label: 'Ciudad' },
    { id: 'phone', label: 'Teléfono' },
  ];

  const filesTitle = 'Informe Registro proveedores';
  const filesHeaders = [
    'Nombre',
    'NIT',
    'DV',
    'Dirección',
    'Departamento',
    'Ciudad',
    'Teléfono',
    'Tipo de actividad',
    'Experiencia',
  ];
  const pdfColsWidth = ['10%', '13%', '10%', '10%', '10%', '10%', '10%', '12%', '15%'];
  let filesData;

  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTypeActivity, setSelectedTypeActivity] = useState('');
  const [numberId, setNumberId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [requestType, setRequestType] = useState('');
  const [searchResult, setSearchResult] = useState<VendorProps[]>([]);

  const tableActions = getActionsList(permissionsList, formPK);

  const table = useTable();

  const [filterName, setFilterName] = useState('');

  const dataFiltered: VendorProps[] = applyFilter({
    inputData: searchResult,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    headLabel,
  });

  useEffect(() => {
    if (savedData) {
      setErrorMessage('');

      let validation;

      if (selectedDepartment && selectedCity && selectedTypeActivity)
        validation =
          savedData.country === selectedDepartment &&
          savedData.city === selectedCity &&
          savedData.sector === selectedTypeActivity;
      if (selectedDepartment && selectedCity)
        validation = savedData.country === selectedDepartment && savedData.city === selectedCity;
      if (selectedDepartment && selectedTypeActivity)
        validation =
          savedData.country === selectedDepartment && savedData.sector === selectedTypeActivity;
      if (selectedCity && selectedTypeActivity)
        validation = savedData.city === selectedCity && savedData.sector === selectedTypeActivity;
      else if (numberId) validation = savedData.numberId === numberId;
      else if (selectedDepartment) validation = savedData.country === selectedDepartment;
      else if (selectedCity) validation = savedData.city === selectedCity;
      else if (selectedTypeActivity) validation = savedData.sector === selectedTypeActivity;
      else if (
        localStorage.getItem('selectedVendor') !== '' ||
        localStorage.getItem('selectedVendor') !== null
      )
        validation = savedData.PK === localStorage.getItem('selectedVendor')!;

      if (validation) {
        const index = searchResult.findIndex((item) => item.PK === savedData.PK);

        if (index !== -1) searchResult[index] = savedData;
        else {
          setSearchResult([savedData, ...searchResult]);
        }
      } else {
        setSelectedDepartment('');
        setSelectedCity('');
        setSelectedTypeActivity('');
        setNumberId('');
        setSearchResult([savedData]);
      }

      resertTableFilters();
    }
  }, [savedData]);

  useEffect(() => {
    if (requestType && isLoading) {
      const query: Record<string, string> = {};

      if (numberId) query.numberId = numberId;
      if (selectedVendor) query.PK = selectedVendor;
      if (selectedDepartment) query.country = selectedDepartment;
      if (selectedCity) query.city = selectedCity;
      if (selectedTypeActivity) query.sector = selectedTypeActivity;

      query.action = requestType === 'search' ? 'SEARCH' : 'INFORM';

      const vendorRq = VendorService.getVendor(query);

      vendorRq
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
              item.numberId,
              item.dv,
              item.address,
              item.departmentName,
              item.cityName,
              item.phone,
              item.typeActivity,
              item.experience,
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
      !numberId &&
      !selectedVendor &&
      !selectedDepartment &&
      !selectedCity &&
      !selectedTypeActivity
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
              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  disabled={
                    selectedCity !== '' ||
                    selectedDepartment !== '' ||
                    selectedTypeActivity !== '' ||
                    selectedVendor !== ''
                  }
                  fullWidth
                  size="small"
                  label="NIT sin DV"
                  value={numberId}
                  onChange={(e) => setNumberId(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <TextField
                  defaultValue=""
                  disabled={
                    selectedCity !== '' ||
                    selectedDepartment !== '' ||
                    selectedTypeActivity !== '' ||
                    numberId !== ''
                  }
                  select
                  fullWidth
                  size="small"
                  label="Proveedor"
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {vendorList.map((vendor: any) => (
                    <MenuItem key={vendor.PK} value={vendor.PK}>
                      {vendor.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  defaultValue=""
                  disabled={numberId !== '' || selectedVendor !== ''}
                  select
                  fullWidth
                  size="small"
                  label="Departamento"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {departmentList.map((department: any) => (
                    <MenuItem key={department.PK} value={department.PK}>
                      {department.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  defaultValue=""
                  disabled={numberId !== '' || selectedVendor !== ''}
                  select
                  fullWidth
                  size="small"
                  label="Ciudad"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {cityList.map((city: any) => (
                    <MenuItem key={city.PK} value={city.PK}>
                      {city.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  defaultValue=""
                  disabled={numberId !== '' || selectedVendor !== ''}
                  select
                  fullWidth
                  size="small"
                  label="Tipo de actividad"
                  value={selectedTypeActivity}
                  onChange={(e) => setSelectedTypeActivity(e.target.value)}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  <MenuItem value="DISTRIBUIDOR">DISTRIBUIDOR</MenuItem>
                  <MenuItem value="INTERMEDIARIO">INTERMEDIARIO</MenuItem>
                  <MenuItem value="FABRICANTE">FABRICANTE</MenuItem>
                  <MenuItem value="IMPORTADOR">IMPORTADOR</MenuItem>
                  <MenuItem value="SERVICIOS">SERVICIOS</MenuItem>
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
                      disabled={numberId !== '' || selectedVendor !== '' || isLoading}
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
                      disabled={numberId !== '' || selectedVendor !== '' || isLoading}
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
