import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

import { PrintHeader } from 'src/components/pdf';

// ----------------------------------------------------------------------

interface Props {
  headerData: any;
  data: any;
}

export function RequisitionPrint({ headerData, data }: Props) {
  const styles = StyleSheet.create({
    page: {
      padding: '30px',
      paddingTop: '85px',
      fontSize: 8,
      fontFamily: 'Helvetica',
      backgroundColor: '#fff',
    },
    table: {
      width: 'auto',
      display: 'flex',
      borderStyle: 'solid',
      borderWidth: 2,
      borderColor: '#000',
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    tableRow: {
      flexDirection: 'row',
    },
    tableCell: {
      borderStyle: 'solid',
      borderWidth: 2,
      borderColor: '#000',
      borderLeftWidth: 0,
      borderTopWidth: 0,
      padding: 2,
      fontSize: 9,
      textAlign: 'left',
    },
    headerCell: {
      backgroundColor: '#dbdbdbff',
    },
    headerCellText: {
      color: '#000',
    },
    textCentered: {
      textAlign: 'center',
    },
    boldText: {
      fontWeight: 700,
    },
    paragraph: {
      lineHeight: 0.6,
    },
    onlyBottomBorder: {
      borderTopWidth: 0,
      borderRightWidth: 0,
      borderLeftWidth: 0,
    },
    noBorders: {
      borderTopWidth: 0,
      borderRightWidth: 0,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
    },
  });

  return (
    <Document>
      <Page size="LETTER" orientation="portrait" style={styles.page}>
        <PrintHeader title="REQUISICIÓN DE PRODUCTOS Y/O SERVICIOS" data={headerData} />

        <View style={[styles.table, styles.noBorders, { marginTop: '10px' }]}>
          <View style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCell, styles.noBorders, { width: '15%' }]}>
              <Text style={styles.boldText}>Ciudad y fecha: </Text>
            </View>
            <View
              style={[
                styles.tableCell,
                styles.onlyBottomBorder,
                { width: '35%', marginRight: '10px' },
              ]}
            >
              <Text>
                {data.requisition.cityName} {data.requisition.createdAt.slice(0, 10)}
              </Text>
            </View>
            <View
              style={[styles.tableCell, styles.noBorders, { width: '15%', marginLeft: '10px' }]}
            >
              <Text style={styles.boldText}>Requisición #: </Text>
            </View>
            <View style={[styles.tableCell, styles.onlyBottomBorder, { width: '35%' }]}>
              <Text>{data.requisition.PK.match(/\d+/g)[0]}</Text>
            </View>
          </View>
          <View style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCell, styles.noBorders, { width: '15%' }]}>
              <Text style={styles.boldText}>Solicitante: </Text>
            </View>
            <View
              style={[
                styles.tableCell,
                styles.onlyBottomBorder,
                { width: '35%', marginRight: '10px' },
              ]}
            >
              <Text>{data.requisition.requesterName}</Text>
            </View>
            <View
              style={[styles.tableCell, styles.noBorders, { width: '15%', marginLeft: '10px' }]}
            >
              <Text style={styles.boldText}>Proceso: </Text>
            </View>
            <View style={[styles.tableCell, styles.onlyBottomBorder, { width: '35%' }]}>
              <Text>{data.requisition.proccessName}</Text>
            </View>
          </View>
          <View style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCell, styles.noBorders, { width: '15%' }]}>
              <Text style={styles.boldText}>Lugar de entrega: </Text>
            </View>
            <View
              style={[
                styles.tableCell,
                styles.onlyBottomBorder,
                { width: '35%', marginRight: '10px' },
              ]}
            >
              <Text>{data.requisition.deliveryPlace}</Text>
            </View>
            <View
              style={[styles.tableCell, styles.noBorders, { width: '15%', marginLeft: '10px' }]}
            >
              <Text style={styles.boldText}>Código proyecto: </Text>
            </View>
            <View style={[styles.tableCell, styles.onlyBottomBorder, { width: '35%' }]}>
              <Text>{data.requisition.costCenterCode}</Text>
            </View>
          </View>
          <View style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCell, styles.noBorders, { width: '15%' }]}>
              <Text style={styles.boldText}>Nombre proyecto: </Text>
            </View>
            <View style={[styles.tableCell, styles.onlyBottomBorder, { width: '85%' }]}>
              <Text>{data.requisition.costCenterName}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.table, { marginTop: '10px' }]}>
          <View style={styles.tableRow} wrap={false}>
            <View
              style={[styles.tableCell, styles.headerCell, styles.textCentered, { width: '10%' }]}
            >
              <Text style={[styles.boldText, styles.headerCellText]}>ITEM</Text>
            </View>
            <View
              style={[styles.tableCell, styles.headerCell, styles.textCentered, { width: '40%' }]}
            >
              <Text style={[styles.boldText, styles.headerCellText]}>DESCRIPCIÓN</Text>
            </View>
            <View
              style={[styles.tableCell, styles.headerCell, styles.textCentered, { width: '30%' }]}
            >
              <Text style={[styles.boldText, styles.headerCellText]}>FECHA REQUERIDA</Text>
            </View>
            <View
              style={[styles.tableCell, styles.headerCell, styles.textCentered, { width: '10%' }]}
            >
              <Text style={[styles.boldText, styles.headerCellText]}>UNIDAD</Text>
            </View>
            <View
              style={[styles.tableCell, styles.headerCell, styles.textCentered, { width: '10%' }]}
            >
              <Text style={[styles.boldText, styles.headerCellText]}>CANTIDAD</Text>
            </View>
          </View>

          {data.items.map((item: any, index: number) => (
            <View key={item.SK} style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: '10%' }]}>
                <Text>{index + 1}</Text>
              </View>
              <View style={[styles.tableCell, { width: '40%' }]}>
                <Text>{item.itemName}</Text>
              </View>
              <View style={[styles.tableCell, { width: '30%' }]}>
                <Text>{item.requiredDate.slice(0, 10)}</Text>
              </View>
              <View style={[styles.tableCell, { width: '10%' }]}>
                <Text>{item.itemUnit}</Text>
              </View>
              <View style={[styles.tableCell, { width: '10%' }]}>
                <Text>{item.quantity}</Text>
              </View>
            </View>
          ))}

          <View style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCell, { width: '100%' }]}>
              <Text>
                <Text style={styles.boldText}>Observaciones: </Text>
                {data.requisition.observations || ''}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.table, { marginTop: '10px' }]}>
          <View style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCell, { width: '50%' }]}>
              <Text>
                <Text style={styles.boldText}>Revisó: </Text>
              </Text>
            </View>
            <View style={[styles.tableCell, { width: '50%' }]}>
              <Text>
                <Text style={styles.boldText}>Aprobó: </Text>
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
