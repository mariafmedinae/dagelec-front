import 'dayjs/locale/es';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
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
import RequisitionService from 'src/services/requisition/requisition-service';

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

import { ChangeStatus } from './change-status';

// ----------------------------------------------------------------------

interface Props {
  formPK: string;
  permissionsList: any;
  applicantList: any;
  costCenterList: any;
  savedData: any;
  handleUpdateAction: (PK: string) => void;
  handleManageAction: (PK: string) => void;
  hideItemSection: () => void;
}

export function Search({
  formPK,
  permissionsList,
  applicantList,
  costCenterList,
  savedData,
  handleUpdateAction,
  handleManageAction,
  hideItemSection,
}: Props) {
  type ItemProps = {
    PK: string;
    createdAt: string;
    costCenterName: string;
    costCenterCode: string;
    proccessName: string;
    applicantName: string;
    status: string;
  };

  const headLabel = [
    { id: '', label: '' },
    { id: 'PK', label: 'Consecutivo|PK' },
    { id: 'createdAt', label: 'Fecha de creación' },
    { id: 'costCenterName', label: 'Proyecto' },
    { id: 'costCenterCode', label: 'Código proyecto' },
    { id: 'proccessName', label: 'Proceso' },
    { id: 'applicantName', label: 'Solicitante' },
    { id: 'status', label: 'Estado' },
  ];

  const filesTitle = 'Informe Requisiciones';
  const filesHeaders = [
    'Cons.',
    'Fecha de creación',
    'Ciudad',
    'Proyecto',
    'Código proyecto',
    'Proceso',
    'Solicitante',
    'Lugar de entrega',
    'Estado',
  ];
  const pdfColsWidth = ['5%', '10%', '10%', '15%', '10%', '10%', '15%', '15%', '10%'];
  let filesData;

  const [selectedApplicant, setSelectedApplicant] = useState('');
  const [selectedCostCenter, setSelectedCostCenter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState<any>(null);
  const [selectedFinishDate, setSelectedFinishDate] = useState<any>(null);
  const [selectedPending, setSelectedPending] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [requestType, setRequestType] = useState('');
  const [searchResult, setSearchResult] = useState<ItemProps[]>([]);

  const [openChangeStatus, setOpenChangeStatus] = useState(false);
  const [openChangeStatusAction, setOpenChangeStatusAction] = useState('false');
  const [changeStatusPK, setChangeStatusPK] = useState<any>('');

  const tableActions = getActionsList(permissionsList, formPK);
  const [dynamicTableActions, setDynamicTableActions] = useState<any>([]);

  const table = useTable();

  const [filterName, setFilterName] = useState('');

  const dataFiltered: ItemProps[] = applyFilter({
    inputData: searchResult,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    headLabel,
  });

  useEffect(() => {
    if (savedData) {
      setErrorMessage('');

      let validation;

      // if (selectedCategory && selectedGroup && selectedSubgroup)
      //   validation =
      //     savedData.category === selectedCategory &&
      //     savedData.group === selectedGroup &&
      //     savedData.subgroup === selectedSubgroup;
      // else if (selectedCategory && selectedGroup)
      //   validation = savedData.category === selectedCategory && savedData.group === selectedGroup;
      // else if (selectedCategory) validation = savedData.category === selectedCategory;

      if (validation) {
        const index = searchResult.findIndex((item) => item.PK === savedData.PK);

        if (index !== -1) searchResult[index] = savedData;
        else {
          setSearchResult([savedData, ...searchResult]);
        }
      } else {
        setSelectedApplicant('');
        setSelectedCostCenter('');
        setSelectedStatus('');
        setSelectedStartDate(null);
        setSelectedFinishDate(null);
        setSelectedPending(false);
        setSearchResult([savedData]);
      }

      resertTableFilters();
    }
  }, [savedData]);

  useEffect(() => {
    if (selectedPending) {
      setSelectedApplicant('');
      setSelectedCostCenter('');
      setSelectedStatus('');
      setSelectedStartDate(null);
      setSelectedFinishDate(null);
    }
  }, [selectedPending]);

  useEffect(() => {
    if (requestType && isLoading) {
      const query: Record<string, string> = {};
      if (selectedApplicant) query.applicant = selectedApplicant;
      if (selectedCostCenter) query.costCenter = selectedCostCenter;
      if (selectedStatus) query.status = selectedStatus;
      if (selectedStartDate) query.startDate = selectedStartDate;
      if (selectedFinishDate) query.finishDate = selectedFinishDate;

      const rowActions = [];
      if (tableActions.includes('PRINT')) rowActions.push('PRINT');
      if (selectedPending) {
        if (tableActions.includes('APPROVE')) rowActions.push('APPROVE');

        query.pending = 'Pending';
      } else {
        if (tableActions.includes('UPDATE')) rowActions.push('UPDATE');
        if (tableActions.includes('MANAGE')) rowActions.push('MANAGE');
        if (tableActions.includes('SEND')) rowActions.push('SEND');
      }
      setDynamicTableActions(rowActions);

      query.action = requestType === 'search' ? 'SEARCH' : 'INFORM';

      const itemRq = RequisitionService.getRequisition(query);

      itemRq
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
              `${item.PK.match(/\d+/g)[0]}`,
              item.createdAt,
              item.cityName,
              item.costCenterName,
              item.costCenterCode,
              item.proccessName,
              item.applicantName,
              item.deliveryPlace,
              item.status,
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
              { header: 'Cons.', key: 'PK', width: 30 },
              { header: 'Fecha de creación', key: 'createdAt', width: 30 },
              { header: 'Ciudad', key: 'cityName', width: 30 },
              { header: 'Proyecto', key: 'costCenterName', width: 30 },
              { header: 'Código proyecto', key: 'costCenterCode', width: 30 },
              { header: 'Proceso', key: 'proccessName', width: 30 },
              { header: 'Solicitante', key: 'applicantName', width: 30 },
              { header: 'Lugar de entrega', key: 'deliveryPlace', width: 30 },
              { header: 'Estado', key: 'status', width: 30 },
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
    hideItemSection();

    if (
      !selectedApplicant &&
      !selectedCostCenter &&
      !selectedStatus &&
      !selectedStartDate &&
      !selectedFinishDate &&
      !selectedPending
    ) {
      setErrorMessage('Debe de ingresar al menos un criterio de búsqueda.');
      setIsLoading(false);
      return;
    }

    if ((selectedStartDate && !selectedFinishDate) || (!selectedStartDate && selectedFinishDate)) {
      setErrorMessage('Debe de ingresar fecha de inicio y fecha final');
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
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  disabled={selectedPending}
                  defaultValue=""
                  select
                  fullWidth
                  size="small"
                  label="Proyecto"
                  value={selectedCostCenter}
                  onChange={(e) => setSelectedCostCenter(e.target.value)}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {costCenterList.map((costCenter: any) => (
                    <MenuItem key={costCenter.PK} value={costCenter.PK}>
                      {costCenter.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  disabled={selectedPending}
                  defaultValue=""
                  select
                  fullWidth
                  size="small"
                  label="Solicitante"
                  value={selectedApplicant}
                  onChange={(e) => setSelectedApplicant(e.target.value)}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {applicantList.map((applicant: any) => (
                    <MenuItem key={applicant.PK} value={applicant.PK}>
                      {applicant.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  disabled={selectedPending}
                  defaultValue=""
                  select
                  fullWidth
                  size="small"
                  label="Estado"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  <MenuItem value="Guardada">Guardada</MenuItem>
                  <MenuItem value="EnRevisión1">En Revisión 1</MenuItem>
                  <MenuItem value="EnRevisión2">En Revisión 2</MenuItem>
                  <MenuItem value="EnAprobación">En Aprobación</MenuItem>
                  <MenuItem value="Aprobada">Aprobada</MenuItem>
                  <MenuItem value="Rechazada">Rechazada</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                  <DatePicker
                    disabled={selectedPending}
                    label="Fecha de inicio"
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    value={selectedStartDate ? dayjs(selectedStartDate) : null}
                    onChange={(newValue) => {
                      setSelectedStartDate(newValue ? newValue.toISOString() : null);
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                  <DatePicker
                    disabled={selectedPending}
                    label="Fecha final"
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    minDate={dayjs(selectedStartDate)}
                    value={selectedFinishDate ? dayjs(selectedFinishDate) : null}
                    onChange={(newValue) => {
                      setSelectedFinishDate(newValue ? newValue.toISOString() : null);
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid size={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedPending}
                      onChange={(event) => setSelectedPending(event.target.checked)}
                    />
                  }
                  label="Requisiciones pendientes de aprobación"
                />
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
                      disabled={isLoading}
                      variant="outlined"
                      color="error"
                      loading={isLoading && requestType === 'pdf'}
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
                      disabled={isLoading}
                      variant="outlined"
                      color="success"
                      loading={isLoading && requestType === 'excel'}
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
                          tableActions={dynamicTableActions}
                          onUpdateAction={() => handleUpdateAction(row.PK)}
                          onManageAction={() => handleManageAction(row.PK)}
                          onApproveAction={() => {
                            setChangeStatusPK(row.PK);
                            setOpenChangeStatus(true);
                            setOpenChangeStatusAction('APPROVE');
                          }}
                          onSendAction={() => {
                            setChangeStatusPK(row.PK);
                            setOpenChangeStatus(true);
                            setOpenChangeStatusAction('SEND');
                          }}
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

        {openChangeStatus && (
          <ChangeStatus
            openAlert={openChangeStatus}
            action={openChangeStatusAction}
            PK={changeStatusPK}
            onCloseAlert={() => {
              setChangeStatusPK('');
              setOpenChangeStatus(false);
            }}
            handleSavedElement={() => {}}
          />
        )}
      </Card>
    </>
  );
}
