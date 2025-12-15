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
import IngredientService from 'src/services/ingredient-coding/ingredient-coding-service';

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

import { DeleteAlert } from './delete-alert';
import { IngredientInfo } from './ingredient-info';

// ----------------------------------------------------------------------

interface Props {
  formPK: string;
  permissionsList: any;
  groupList: any;
  savedData: any;
  handleUpdateAction: (PK: string) => void;
}

export function Search({
  formPK,
  permissionsList,
  groupList,
  savedData,
  handleUpdateAction,
}: Props) {
  type IngredientProps = {
    PK: string;
    code: string;
    name: string;
    unit: string;
    storageName: boolean;
  };

  const headLabel = [
    { id: '', label: '' },
    { id: 'code', label: 'Código' },
    { id: 'name', label: 'Nombre|info' },
    { id: 'unit', label: 'Unidad medida' },
    { id: 'storageName', label: 'Condiciones almacenamiento' },
  ];

  const filesTitle = 'Informe Base de datos de productos';
  const filesHeaders = [
    'Grupo',
    'Código',
    'Artículo',
    'Unidad medida',
    '% Merma',
    '% Utilizable',
    'Peso neto',
    'Almacenamiento',
    'Calrias',
  ];
  const pdfColsWidth = ['15%', '10%', '16%', '10%', '8%', '8%', '10%', '15%', '8%'];
  let filesData;

  const [selectedGroup, setSelectedGroup] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [requestType, setRequestType] = useState('');
  const [searchResult, setSearchResult] = useState<IngredientProps[]>([]);

  const [openAlert, setOpenAlert] = useState(false);
  const [deleteElement, setDeleteElement] = useState<any>();

  const [openInfo, setOpenInfo] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>({});

  const tableActions = getActionsList(permissionsList, formPK);

  const table = useTable();

  const [filterName, setFilterName] = useState('');

  const dataFiltered: IngredientProps[] = applyFilter({
    inputData: searchResult,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    headLabel,
  });

  useEffect(() => {
    if (savedData) {
      setErrorMessage('');
      if (savedData.group === selectedGroup) {
        const index = searchResult.findIndex((item) => item.PK === savedData.PK);

        if (index !== -1) searchResult[index] = savedData;
        else {
          setSearchResult([savedData, ...searchResult]);
        }
      } else {
        setSelectedGroup('');
        setSearchResult([savedData]);
      }

      resertTableFilters();
    }
  }, [savedData]);

  useEffect(() => {
    if (requestType && isLoading) {
      const query: Record<string, string> = {};
      if (selectedGroup) query.group = selectedGroup;
      query.action = requestType === 'search' ? 'SEARCH' : 'INFORM';

      const ingredientRq = IngredientService.getIngredient(query);

      ingredientRq
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
              item.groupName,
              item.code,
              item.name,
              item.unit || '',
              item.lossPercentage,
              item.usablePercentage,
              item.weight,
              item.storageName,
              item.calories,
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
              { header: 'Grupo', key: 'groupName', width: 30 },
              { header: 'Código', key: 'code', width: 30 },
              { header: 'Artículo', key: 'name', width: 30 },
              { header: 'Unidad medida', key: 'unit', width: 30 },
              { header: '% Merma', key: 'lossPercentage', width: 30 },
              { header: '% Utilizable', key: 'usablePercentage', width: 30 },
              { header: 'Peso neto', key: 'weight', width: 30 },
              { header: 'Almacenamiento', key: 'storageName', width: 30 },
              { header: 'Calorias', key: 'calories', width: 30 },
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

    if (!selectedGroup) {
      setErrorMessage('Debe de ingresar al menos un criterio de búsqueda.');
      setIsLoading(false);
      return;
    }

    setRequestType(request);
  };

  const handleDeleteAction = (element: any) => {
    setOpenAlert(true);
    setDeleteElement(element);
  };

  const deleteRow = () => {
    setSearchResult((prevItems) => prevItems.filter((item) => item.PK !== deleteElement.PK));
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
              <Grid size={12}>
                <TextField
                  defaultValue=""
                  select
                  fullWidth
                  size="small"
                  label="Grupo"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {groupList.map((group: any) => (
                    <MenuItem key={group.PK} value={group.PK}>
                      {group.name}
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
                          tableActions={tableActions}
                          onUpdateAction={() => handleUpdateAction(row.PK)}
                          onDeleteAction={() => handleDeleteAction(row)}
                          onItemInfo={() => {
                            setSelectedIngredient(row);
                            setOpenInfo(true);
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
      </Card>

      {openInfo && (
        <IngredientInfo
          openInfo={openInfo}
          element={selectedIngredient}
          onCloseInfo={() => setOpenInfo(false)}
        />
      )}

      {openAlert && (
        <DeleteAlert
          openAlert={openAlert}
          action="deleteRecipe"
          element={deleteElement}
          onCloseAlert={() => {
            setDeleteElement(null);
            setOpenAlert(false);
          }}
          handleDeletedElement={deleteRow}
        />
      )}
    </>
  );
}
