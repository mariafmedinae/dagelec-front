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

import RequisitionService from 'src/services/requisition/requisition-service';

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

import { FormItems } from './form-items';
import { DeleteAlert } from './delete-alert';

// ----------------------------------------------------------------------

interface Props {
  permissionsList: any;
  clickedManage: any;
  managedPK: string;
  savedRequisitionData: any;
}

export function Items({ permissionsList, clickedManage, managedPK, savedRequisitionData }: Props) {
  type ItemProps = {
    PK: string;
    SK: string;
    itemName: string;
    itemUnit: string;
    quantity: string;
    requiredDate: string;
  };

  const headLabel = [
    { id: '', label: '' },
    { id: 'itemName', label: 'Item' },
    { id: 'itemUnit', label: 'Unidad de medida' },
    { id: 'quantity', label: 'Cantidad' },
    { id: 'requiredDate', label: 'Fecha requerida|date' },
  ];

  const [globalError, setGlobalError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [searchHeader, setSearchHeader] = useState<any>({ name: '' });
  const [searchResult, setSearchResult] = useState<ItemProps[]>([]);

  const [openAlert, setOpenAlert] = useState(false);
  const [deleteElement, setDeleteElement] = useState<any>();

  const [openForm, setOpenForm] = useState(false);
  const [formAction, setFormAction] = useState('');
  const [requisitionPK, setRequisitionPK] = useState('');
  const [itemSK, setItemSK] = useState('');

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [savedData, setSavedData] = useState<any>();

  const formPK = 'REQUISITION_ITEM';

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
    scrollToBottom();
  }, [clickedManage]);

  useEffect(() => {
    setIsLoading(true);
    setGlobalError(false);

    const requisitionRq = RequisitionService.getRequisition({
      PK: managedPK,
      type: 'P',
      action: 'MANAGE',
    });

    requisitionRq
      .then((res) => {
        setSearchHeader(res.data.requisition);
        setSearchResult(Array.isArray(res.data.items) ? res.data.items : [res.data.items]);
        setRequisitionPK(managedPK);
        setIsLoading(false);
      })
      .catch((error) => {
        setGlobalError(true);
        setIsLoading(false);
      });
  }, [managedPK]);

  useEffect(() => {
    if (savedRequisitionData) {
      if (savedRequisitionData.PK === managedPK) setSearchHeader(savedRequisitionData);
    }
  }, [savedRequisitionData]);

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

  const handleUpdateAction = (rowSK: string) => {
    setFormAction('update');
    setItemSK(rowSK);
    setOpenForm(true);
  };

  const handleDeleteAction = (element: any) => {
    setOpenAlert(true);
    setDeleteElement(element);
  };

  const deleteRow = () => {
    setSearchResult((prevItems) => prevItems.filter((item) => item.SK !== deleteElement.SK));
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
                  Requisición #{managedPK.match(/\d+/)?.[0]}
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
                  Nuevo item
                </Button>
              </Box>
            </CardContent>

            {searchResult.length === 0 && (
              <Typography variant="subtitle2" textAlign="center" sx={{ mb: 3 }}>
                No hay items para mostrar
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
                              onUpdateAction={() => handleUpdateAction(row.SK)}
                              onDeleteAction={() => handleDeleteAction(row)}
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

            {openAlert && (
              <DeleteAlert
                openAlert={openAlert}
                action="deleteItem"
                element={deleteElement}
                onCloseAlert={() => {
                  setDeleteElement(null);
                  setOpenAlert(false);
                }}
                handleDeletedElement={deleteRow}
              />
            )}
          </Card>
        </>
      )}

      {openForm && (
        <FormItems
          openForm={openForm}
          action={formAction}
          requisitionPK={requisitionPK}
          itemSK={itemSK}
          onCloseForm={() => {
            setItemSK('');
            setOpenForm(false);
          }}
          handleSavedData={(data) => setSavedData(data)}
        />
      )}
    </Box>
  );
}
