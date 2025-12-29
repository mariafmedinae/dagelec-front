import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 8,
    fontFamily: 'Helvetica',
  },
  title: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionRow: {
    flexDirection: 'row',
  },
  sectionLabel: {
    width: 18,
    backgroundColor: '#e6e6e6',
    border: '1px solid #000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabelText: {
    transform: 'rotate(-90deg)',
    fontWeight: 'bold',
  },
  table: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    border: '1px solid #000',
    padding: 3,
    flex: 1,
  },
  label: {
    fontSize: 7,
    fontWeight: 'bold',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 8,
    height: 8,
    border: '1px solid #000',
    marginHorizontal: 4,
  },
  small: {
    fontSize: 7,
  },
});

export default function VendorPrint() {
  return (
    <Document>
      <Page size="LETTER" orientation="portrait" style={styles.page}>
        Imprimir
      </Page>
    </Document>
  );
}
