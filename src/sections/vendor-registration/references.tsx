import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  Typography,
} from '@mui/material';

import { getActionsList, verifyPermission } from 'src/utils/permissions-functions';

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

import { ReferenceForm } from './reference-form';

// ----------------------------------------------------------------------

interface Props {
  permissionsList: any;
  data: any;
  vendorPK: string;
}

export function References({ permissionsList, data, vendorPK }: Props) {
  type ReferenceProps = {
    PK: string;
    SK: string;
    client: string;
    contact: string;
    phone: string;
  };

  const headLabel = [
    { id: '', label: '' },
    { id: 'client', label: 'Cliente' },
    { id: 'contact', label: 'Contacto' },
    { id: 'phone', label: 'Teléfono' },
  ];

  const [searchResult, setSearchResult] = useState<any>(data);

  const [openForm, setOpenForm] = useState(false);
  const [formAction, setFormAction] = useState('');
  const [reference, setReference] = useState('');

  const [savedData, setSavedData] = useState<any>();

  const formPK = 'CONTACT';

  const tableActions = getActionsList(permissionsList, formPK);

  const table = useTable();

  const [filterName, setFilterName] = useState('');

  const dataFiltered: ReferenceProps[] = applyFilter({
    inputData: searchResult,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
    headLabel,
  });

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

  const handleUpdateAction = (referenceRow: any) => {
    setFormAction('update');
    setReference(referenceRow);
    setOpenForm(true);
  };

  return (
    <>
      <Box
        sx={{
          m: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'end',
          gap: 2,
          flexFlow: {
            xs: 'column',
            sm: 'row',
          },
        }}
      >
        <Button
          sx={{
            display: verifyPermission(permissionsList, formPK, 'CREATE') ? 'inline-flex' : 'none',
          }}
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={onOpenForm}
        >
          Nuevo referencia
        </Button>
      </Box>

      {searchResult.length === 0 && (
        <Typography variant="subtitle2" textAlign="center" sx={{ my: 3, mx: 2 }}>
          No hay referencias para mostrar
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

      {openForm && (
        <ReferenceForm
          openForm={openForm}
          action={formAction}
          vendorPK={vendorPK}
          reference={reference}
          onCloseForm={() => {
            setReference('');
            setOpenForm(false);
          }}
          handleSavedData={(newData) => setSavedData(newData)}
        />
      )}
    </>
  );
}
