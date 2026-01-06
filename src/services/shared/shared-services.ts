import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';

import httpRequests from '../shared/http-requests';

// ----------------------------------------------------------------------
class SharedServices {
  getList(data: any) {
    return httpRequests.post('/list/query', data);
  }

  saveList(data: any) {
    return httpRequests.post('/list', data);
  }

  uploadFile(url: string, file: File) {
    return httpRequests.put(url, file, { headers: { 'Content-Type': 'binary/octet-stream' } });
  }

  exportPdf = async (file: any) => {
    const doc = file;
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);

    window.open(url, '_blank');
  };

  exportExcel = async (fileName: string, columns: any, data: any, modifyData?: any) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    worksheet.columns = columns;

    worksheet.getRow(1).font = { bold: true };

    data.forEach((row: any) => {
      if (modifyData) {
        modifyData.forEach((element: string) => {
          if (element.toLowerCase().includes('date')) {
            row[element] = row[element].slice(0, 10);
          }
        });
      }

      worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `${fileName}.xlsx`
    );
  };
}

export default new SharedServices();
