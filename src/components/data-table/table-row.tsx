import { useState, useCallback } from 'react';

import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { Box, CircularProgress } from '@mui/material';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { formatCurrency } from 'src/utils/format-currency';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type DataTableRowProps = {
  row: any;
  headLabel: Record<string, any>[];
  tableActions: string[];
  isCreatingPrint?: boolean;
  tableOrigin?: string;
  onUpdateAction?: () => void;
  onManageAction?: () => void;
  onPrintAction?: () => void;
  onItemInfo?: () => void;
  onSendAction?: () => void;
  onApproveAction?: () => void;
  onDeleteAction?: () => void;
};

export function DataTableRow({
  row,
  headLabel,
  tableActions,
  isCreatingPrint = false,
  tableOrigin,
  onUpdateAction,
  onManageAction,
  onPrintAction,
  onItemInfo,
  onSendAction,
  onApproveAction,
  onDeleteAction,
}: DataTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <TableRow hover tabIndex={-1}>
        <TableCell align="center" width="5%">
          {isCreatingPrint && (
            <Box sx={{ marginY: '5px', marginX: '8px' }}>
              <CircularProgress color="inherit" size="20px" />
            </Box>
          )}
          {!isCreatingPrint && tableActions.length > 0 && (
            <IconButton onClick={handleOpenPopover}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
        </TableCell>

        {headLabel.map((headCell) => {
          const columnName = headCell.label;
          const format = columnName.split('|')[1];

          const showIcon = tableOrigin !== 'recipeItems' ? Boolean(row.fileExtension) : true;
          const infoValidation = format === 'info' && showIcon;
          const infoIcon =
            tableOrigin === 'recipeItems'
              ? 'material-symbols:info-outline-rounded'
              : 'solar:eye-bold';

          let label;

          if (format === 'price') label = formatCurrency(row[`${headCell.id}`]);
          else if (format === 'date')
            label = row[`${headCell.id}`] ? row[`${headCell.id}`].slice(0, 10) : '';
          else if (format === 'PK') label = row[`${headCell.id}`].match(/\d+/g)[0];
          else label = row[`${headCell.id}`];

          return (
            headCell.id !== '' && (
              <TableCell
                key={headCell.id + '-' + (row[`${headCell.id}`] ? row[`${headCell.id}`] : 'empty')}
              >
                {label}
                {infoValidation && (
                  <IconButton onClick={onItemInfo!}>
                    <Iconify icon={infoIcon} />
                  </IconButton>
                )}
              </TableCell>
            )
          );
        })}
      </TableRow>

      {openPopover && (
        <Popover
          open={!!openPopover}
          anchorEl={openPopover}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuList
            disablePadding
            sx={{
              p: 0.5,
              gap: 0.5,
              width: 220,
              display: 'flex',
              flexDirection: 'column',
              [`& .${menuItemClasses.root}`]: {
                px: 1,
                gap: 2,
                borderRadius: 0.75,
                [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
              },
            }}
          >
            {tableActions.includes('UPDATE') && (
              <MenuItem
                onClick={() => {
                  onUpdateAction!();
                  handleClosePopover();
                }}
              >
                <Iconify icon="solar:pen-bold" />
                Actualizar
              </MenuItem>
            )}

            {tableActions.includes('MANAGE') && (
              <MenuItem
                onClick={() => {
                  onManageAction!();
                  handleClosePopover();
                }}
              >
                <Iconify icon="mingcute:add-line" />
                Gestionar
              </MenuItem>
            )}

            {tableActions.includes('PRINT') && (
              <MenuItem
                onClick={() => {
                  onPrintAction!();
                  handleClosePopover();
                }}
              >
                <Iconify icon="ic:round-print" />
                Imprimir
              </MenuItem>
            )}

            {tableActions.includes('SEND') && (
              <MenuItem
                onClick={() => {
                  onSendAction!();
                  handleClosePopover();
                }}
              >
                <Iconify icon="fluent:send-clock-20-filled" />
                Enviar para aprobación
              </MenuItem>
            )}

            {tableActions.includes('APPROVE') && (
              <MenuItem
                onClick={() => {
                  onApproveAction!();
                  handleClosePopover();
                }}
              >
                <Iconify icon="material-symbols:order-approve" />
                Aprobar
              </MenuItem>
            )}

            {tableActions.includes('DELETE') && (
              <MenuItem
                onClick={() => {
                  onDeleteAction!();
                  handleClosePopover();
                }}
                sx={{ color: 'error.main' }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
                Eliminar
              </MenuItem>
            )}
          </MenuList>
        </Popover>
      )}
    </>
  );
}
