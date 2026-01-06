import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// ----------------------------------------------------------------------

const styles = StyleSheet.create({
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
  textCentered: {
    textAlign: 'center',
  },
  noRightBorder: {
    borderRightWidth: 0,
  },
  noBottomBorder: {
    borderBottomWidth: 0,
  },
  headerTable: {
    width: 'auto',
    display: 'flex',
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
  },
  headerImage: {
    width: '155px',
    objectFit: 'contain',
  },
  centeredContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: 700,
  },
  headerContainer: {
    position: 'absolute',
    top: '30px',
    left: '30px',
    right: 0,
    width: '553px',
    height: 'auto',
  },
});

interface PrintHeaderProps {
  title: string;
  data: any;
}

export function PrintHeader({ title, data }: PrintHeaderProps) {
  return (
    <View style={styles.headerContainer} fixed>
      <View style={styles.headerTable}>
        <View style={styles.tableRow} wrap={false}>
          <View
            style={[
              styles.tableCell,
              styles.noBottomBorder,
              styles.centeredContent,
              { width: '35%' },
            ]}
          >
            <Image
              src={import.meta.env.VITE_BASE_URL + 'assets/imgs/dagelec.png'}
              style={styles.headerImage}
            />
          </View>
          <View
            style={[
              styles.tableCell,
              styles.noBottomBorder,
              styles.centeredContent,
              { width: '35%' },
            ]}
          >
            <Text style={[styles.headerTitle, styles.textCentered]}>{title}</Text>
          </View>
          <View
            style={[
              styles.tableCell,
              styles.noBottomBorder,
              styles.noRightBorder,
              { width: '30%', padding: 0 },
            ]}
          >
            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: '50%' }]}>
                <Text style={styles.textCentered}>CÓDIGO</Text>
              </View>
              <View style={[styles.tableCell, styles.noRightBorder, { width: '50%' }]}>
                <Text style={styles.textCentered}>{data.code}</Text>
              </View>
            </View>

            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: '50%' }]}>
                <Text style={styles.textCentered}>FECHA</Text>
              </View>
              <View style={[styles.tableCell, styles.noRightBorder, { width: '50%' }]}>
                <Text style={styles.textCentered}>{data.date}</Text>
              </View>
            </View>

            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, styles.noBottomBorder, { width: '50%', padding: 0 }]}>
                <View style={styles.tableRow} wrap={false}>
                  <View style={[styles.tableCell, styles.noBottomBorder, { width: '50%' }]}>
                    <Text style={styles.textCentered}>VESIÓN</Text>
                  </View>
                  <View
                    style={[
                      styles.tableCell,
                      styles.noBottomBorder,
                      styles.noRightBorder,
                      { width: '50%' },
                    ]}
                  >
                    <Text style={styles.textCentered}>{data.version}</Text>
                  </View>
                </View>
              </View>
              <View
                style={[
                  styles.tableCell,
                  styles.noBottomBorder,
                  styles.noRightBorder,
                  { width: '50%', padding: 0 },
                ]}
              >
                <View style={styles.tableRow} wrap={false}>
                  <View style={[styles.tableCell, styles.noBottomBorder, { width: '50%' }]}>
                    <Text style={styles.textCentered}>PÁGINA</Text>
                  </View>
                  <View
                    style={[
                      styles.tableCell,
                      styles.noBottomBorder,
                      styles.noRightBorder,
                      { width: '50%' },
                    ]}
                  >
                    <Text
                      style={styles.textCentered}
                      render={({ pageNumber, totalPages }) => `${pageNumber} de ${totalPages}`}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
