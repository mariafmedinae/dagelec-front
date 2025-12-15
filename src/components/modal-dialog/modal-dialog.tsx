import { ReactNode } from 'react';

import Dialog from '@mui/material/Dialog';
import { IconButton } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

interface Props {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOpen: boolean;
  handleClose: () => void;
  title: string;
  children: ReactNode;
}

const fullWidth = true;

export function ModalDialog({ maxWidth = 'lg', isOpen, handleClose, title, children }: Props) {
  return (
    <>
      <Dialog open={isOpen} onClose={() => null} fullWidth={fullWidth} maxWidth={maxWidth}>
        <DialogTitle>{title}</DialogTitle>
        <IconButton
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>
        <DialogContent sx={{ pt: 1 }}>{children}</DialogContent>
      </Dialog>
    </>
  );
}
