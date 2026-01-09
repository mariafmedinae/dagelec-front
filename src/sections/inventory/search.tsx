import { useEffect, useState } from 'react';

import {
  Alert,
  Autocomplete,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

import { verifyPermission } from 'src/utils/permissions-functions';

import sharedServices from 'src/services/shared/shared-services';
import ItemService from 'src/services/item-coding/item-coding-service';

import { Inform } from 'src/components/pdf';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface Props {
  formPK: string;
  permissionsList: any;
  itemList: any;
  storeList: any;
}

export function Search({ formPK, permissionsList, itemList, storeList }: Props) {
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

  const [selectedItem, setSelectedItem] = useState('');
  const [selectedStore, setSelectedStore] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [requestType, setRequestType] = useState('');

  useEffect(() => {
    if (requestType && isLoading) {
      const query: Record<string, string> = {};
      if (selectedItem) query.item = selectedItem;
      if (selectedStore) query.PK = selectedStore;
      query.action = requestType === 'search' ? 'SEARCH' : 'INFORM';

      const itemRq = ItemService.getItem(query);

      itemRq
        .then((res) => {
          if (res.data.length === 0) {
            setErrorMessage('No se encontraron resultados para generar el informe.');
            setIsLoading(false);
            return;
          }
          if (requestType === 'PDF') {
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
        });
    }
  }, [isLoading]);

  const handleSearch = (request: string) => {
    setIsLoading(true);
    setErrorMessage('');

    if (!selectedItem && !selectedStore) {
      setErrorMessage('Debe de ingresar al menos un criterio de búsqueda.');
      setIsLoading(false);
      return;
    }

    setRequestType(request);
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
                <Autocomplete
                  size="small"
                  options={itemList}
                  noOptionsText="No hay resultados"
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option.PK === value.PK}
                  value={itemList.find((item: any) => item.PK === selectedItem) || null}
                  onChange={(event, newValue) => {
                    const value = newValue ? newValue.PK : '';
                    setSelectedItem(value);
                  }}
                  renderInput={(params) => <TextField {...params} label="Item" />}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  size="small"
                  options={storeList}
                  noOptionsText="No hay resultados"
                  getOptionLabel={(option) => option.name || ''}
                  isOptionEqualToValue={(option, value) => option.PK === value.PK}
                  value={storeList.find((item: any) => item.PK === selectedStore) || null}
                  onChange={(event, newValue) => {
                    const value = newValue ? newValue.PK : '';
                    setSelectedStore(value);
                  }}
                  renderInput={(params) => <TextField {...params} label="Bodega" />}
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

              {verifyPermission(permissionsList, formPK, 'INFORM') && (
                <>
                  <Grid size={{ xs: 6 }}>
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

                  <Grid size={{ xs: 6 }}>
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
      </Card>
    </>
  );
}
