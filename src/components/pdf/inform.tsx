import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

import { formatCurrency } from 'src/utils/format-currency';

// ----------------------------------------------------------------------

interface Props {
  title: string;
  headers: any;
  data: any;
  colsWidth: any;
  pricesIndex?: any; //Array with index when currency styles are needed
}

export function Inform({ title, headers, data, colsWidth, pricesIndex = [] }: Props) {
  const styles = StyleSheet.create({
    page: {
      backgroundColor: '#fff',
      padding: '1cm',
    },
    headerContainer: {
      position: 'absolute',
      top: '0.5cm',
      left: 0,
      right: 0,
      height: 80,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      marginHorizontal: '1cm',
    },
    headerImage: {
      height: 45,
      objectFit: 'contain',
    },
    headerTitleContainer: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    headerTitle: {
      fontWeight: 700,
      fontSize: '14px',
    },
    mainContent: {
      marginTop: 70,
    },
    table: {
      display: 'flex',
      width: 'auto',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    tableRow: {
      margin: 'auto',
      flexDirection: 'row',
    },
    tableCol: {
      borderStyle: 'solid',
      borderWidth: 1,
      borderLeftWidth: 0,
      borderTopWidth: 0,
    },
    tableCellHeader: {
      textAlign: 'center',
      fontWeight: 'bold',
    },
    tableCell: {
      margin: 3,
      fontSize: 10,
    },
  });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.headerContainer}>
          <Image
            src={import.meta.env.VITE_BASE_URL + 'assets/imgs/dagelec.png'}
            style={styles.headerImage}
          />
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {headers.map((col: any, index: any) => (
                <View key={index} style={[styles.tableCol, { width: colsWidth[index] }]}>
                  <Text style={[styles.tableCell, styles.tableCellHeader]}>{col}</Text>
                </View>
              ))}
            </View>

            {data.map((item: any, rowIndex: any) => (
              <View key={rowIndex} style={styles.tableRow} wrap={false}>
                {Object.values(item).map((value: any, colIndex: any) => (
                  <View key={colIndex} style={[styles.tableCol, { width: colsWidth[colIndex] }]}>
                    <Text
                      style={[
                        styles.tableCell,
                        {
                          textAlign: pricesIndex.find((number: any) => number === colIndex)
                            ? 'right'
                            : 'left',
                        },
                      ]}
                    >
                      {pricesIndex.find((number: any) => number === colIndex)
                        ? formatCurrency(value)
                        : value}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}
