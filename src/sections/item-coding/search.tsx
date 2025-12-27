import { useEffect, useState } from 'react';

import {
  Alert,
  Autocomplete,
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
import ItemService from 'src/services/item-coding/item-coding-service';

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
  categoryList: any;
  savedData: any;
  handleUpdateAction: (PK: string) => void;
}

export function Search({
  formPK,
  permissionsList,
  categoryList,
  savedData,
  handleUpdateAction,
}: Props) {
  type ItemProps = {
    PK: string;
    name: string;
    unit: string;
    status: string;
  };

  const headLabel = [
    { id: '', label: '' },
    { id: 'name', label: 'Nombre' },
    { id: 'unit', label: 'Unidad medida' },
    { id: 'status', label: 'Estado' },
  ];

  const filesTitle = 'Informe Codificación productos y servicios';
  const filesHeaders = [
    'Referencia',
    'Categoría',
    'Grupo',
    'Subgrupo',
    'Nombre',
    'Nombre largo',
    'IVA',
    'Unidad medida',
    'Estado',
  ];
  const pdfColsWidth = ['8%', '13%', '13%', '13%', '12%', '15%', '7%', '12%', '7%'];
  let filesData;

  const [groupList, setGroupList] = useState<any[]>([]);
  const [subgroupList, setSubgroupList] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubgroup, setSelectedSubgroup] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [requestType, setRequestType] = useState('');
  const [searchResult, setSearchResult] = useState<ItemProps[]>([]);

  const tableActions = getActionsList(permissionsList, formPK);

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

      if (selectedCategory && selectedGroup && selectedSubgroup)
        validation =
          savedData.category === selectedCategory &&
          savedData.group === selectedGroup &&
          savedData.subgroup === selectedSubgroup;
      else if (selectedCategory && selectedGroup)
        validation = savedData.category === selectedCategory && savedData.group === selectedGroup;
      else if (selectedCategory) validation = savedData.category === selectedCategory;

      if (validation) {
        const index = searchResult.findIndex((item) => item.PK === savedData.PK);

        if (index !== -1) searchResult[index] = savedData;
        else {
          setSearchResult([savedData, ...searchResult]);
        }
      } else {
        setSelectedCategory('');
        setSelectedGroup('');
        setSelectedSubgroup('');
        setSearchResult([savedData]);
      }

      resertTableFilters();
    }
  }, [savedData]);

  useEffect(() => {
    if (requestType && isLoading) {
      const query: Record<string, string> = {};
      if (selectedCategory) query.category = selectedCategory;
      if (selectedGroup) query.group = selectedGroup;
      if (selectedSubgroup) query.subgroup = selectedSubgroup;
      query.action = requestType === 'search' ? 'SEARCH' : 'INFORM';

      const itemRq = ItemService.getItem(query);

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
              item.reference,
              item.categoryName,
              item.groupName,
              item.subgroupName,
              item.name,
              item.longName || '',
              item.iva,
              item.unit,
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
              { header: 'Referencia', key: 'reference', width: 30 },
              { header: 'Categoría', key: 'categoryName', width: 30 },
              { header: 'Grupo', key: 'groupName', width: 30 },
              { header: 'Subgrupo', key: 'subgroupName', width: 30 },
              { header: 'Nombre', key: 'name', width: 30 },
              { header: 'Nombre largo', key: 'longName', width: 30 },
              { header: 'IVA', key: 'iva', width: 30 },
              { header: 'Unidad medida', key: 'unit', width: 30 },
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

    if (!selectedCategory && !selectedGroup && !selectedSubgroup) {
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

  const getGroupList = async (categoryPK: string) => {
    setSelectedGroup('');
    setSelectedSubgroup('');

    if (categoryPK !== '') {
      const categoryRq = sharedServices.getList({
        parent: categoryPK,
        entity: 'GROUP',
      });

      categoryRq
        .then((res) => {
          setGroupList(res.data);
        })
        .catch((error) => {
          setSelectedCategory('');
          setErrorMessage(
            'Hubo un error al cargar los grupos. Seleccione la categoría para intentar nuevamente.'
          );
        });
    }
  };

  const getSubgroupList = async (groupPK: string) => {
    setSelectedSubgroup('');

    if (groupPK !== '') {
      const groupRq = sharedServices.getList({
        parent: groupPK,
        entity: 'SUBGROUP',
      });

      groupRq
        .then((res) => {
          setSubgroupList(res.data);
        })
        .catch((error) => {
          setSelectedGroup('');
          setErrorMessage(
            'Hubo un error al cargar los subgrupos. Seleccione el grupo para intentar nuevamente.'
          );
        });
    }
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
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  defaultValue=""
                  select
                  fullWidth
                  size="small"
                  label="Categoría"
                  value={selectedCategory}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCategory(value);
                    setErrorMessage('');
                    getGroupList(value);
                  }}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {categoryList.map((category: any) => (
                    <MenuItem key={category.PK} value={category.PK}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Autocomplete
                  size="small"
                  options={groupList}
                  noOptionsText="No hay resultados"
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option.PK === value.PK}
                  value={groupList.find((item) => item.PK === selectedGroup) || null}
                  onChange={(event, newValue) => {
                    const value = newValue ? newValue.PK : '';
                    setSelectedGroup(value);
                    setErrorMessage('');
                    getSubgroupList(value);
                  }}
                  renderInput={(params) => <TextField {...params} label="Grupo" />}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                <Autocomplete
                  size="small"
                  options={subgroupList}
                  noOptionsText="No hay resultados"
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option.PK === value.PK}
                  value={subgroupList.find((item) => item.PK === selectedSubgroup) || null}
                  onChange={(event, newValue) => {
                    const value = newValue ? newValue.PK : '';
                    setSelectedSubgroup(value);
                  }}
                  renderInput={(params) => <TextField {...params} label="Subgrupo" />}
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
