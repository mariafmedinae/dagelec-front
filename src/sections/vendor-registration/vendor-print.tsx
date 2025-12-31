import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: '30px',
    fontSize: 8,
    fontFamily: 'Helvetica',
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
    fontSize: 8,
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
  rotatedText: {
    transformOrigin: 'center',
  },
  paragraph: {
    lineHeight: 0.6,
  },
});

export default function VendorPrint() {
  return (
    <Document>
      <Page size="LETTER" orientation="portrait" style={styles.page}>
        <View style={[styles.table, { marginTop: '10px' }]}>
          {/* REPR. LEGAL */}
          <View style={styles.tableRow} wrap={false}>
            <View
              style={[styles.tableCell, styles.headerCell, styles.textCentered, { width: '6%' }]}
            >
              <Text
                style={[
                  styles.boldText,
                  styles.headerCellText,
                  styles.rotatedText,
                  {
                    width: '50px',
                    height: '30px',
                    transform: 'rotate(-90deg) translate(0px, -5px)',
                  },
                ]}
              >
                {`REPR.\nLEGAL`}
              </Text>
            </View>
            <View style={{ width: '94%' }}>
              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, { width: '70%', height: '36px' }]}>
                  <Text>
                    <Text style={[styles.boldText]}>NOMBRE REPRESENTANTE LEGAL</Text>
                  </Text>
                </View>
                <View style={[styles.tableCell, { width: '30%', height: '36px' }]}>
                  <Text>
                    <Text style={[styles.boldText]}>FIRMA</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* OTROS ANEXOS */}
          <View style={styles.tableRow} wrap={false}>
            <View
              style={[styles.tableCell, styles.headerCell, styles.textCentered, { width: '6%' }]}
            >
              <Text
                style={[
                  styles.boldText,
                  styles.headerCellText,
                  styles.rotatedText,
                  {
                    width: '50px',
                    height: '75px',
                    transform: 'rotate(-90deg) translate(-1px, 17px)',
                  },
                ]}
              >
                {`OTROS\nANEXOS`}
              </Text>
            </View>
            <View style={{ width: '94%' }}>
              <View style={styles.tableRow} wrap={false}>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '50%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>PERSONA JURÍDICA</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '50%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>PERSONA NATURAL</Text>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, { width: '50%' }]}>
                  <Text style={[styles.paragraph]}>
                    - Certificado de Existencia y Representación Legal
                  </Text>
                  <Text style={[styles.paragraph, { marginLeft: '5px' }]}>
                    (Vigencia inferior a 3 meses)
                  </Text>
                  <Text style={[styles.paragraph]}>- Certificado RUT</Text>
                  <Text style={[styles.paragraph]}>
                    - Evaluación de Estándares Mínimos del SG-SST
                  </Text>
                  <Text style={[styles.paragraph]}>
                    - Certificación Cuenta Bancaria para realizar transferencias{' '}
                  </Text>
                  <Text style={[styles.paragraph]}>
                    - Certificaciones del Sistema de Gestión (Al contar con ellas)
                  </Text>
                </View>
                <View style={[styles.tableCell, { width: '50%' }]}>
                  <Text style={[styles.paragraph]}>- Fotocopia de la cédula</Text>
                  <Text style={[styles.paragraph]}>- Certificado RUT</Text>
                  <Text style={[styles.paragraph]}>
                    - Certificación Cuenta Bancaria para realizar transferencias
                  </Text>
                  <Text style={[styles.paragraph]}>- Pago seguridad social (EPS, ARL, AFP)</Text>
                </View>
              </View>
            </View>
          </View>

          {/* IMPORTANTE */}
          <View style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCell, { width: '100%' }]}>
              <Text>
                <Text style={[styles.boldText, styles.paragraph]}>IMPORTANTE: </Text>
                La documentación aquí listada corresponde a requisitos generales. Según el tipo de
                servicio y/o producto ofrecido, podrían requerirse documentos adicionales
                específicos no contemplados en este formato. Se recomienda verificar con el área de
                compras antes de enviar la inscripción.
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
