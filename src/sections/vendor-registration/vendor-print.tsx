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
      <Page size="A4" style={styles.page}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View
            style={{
              width: 80,
              border: '1px solid #000',
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* LOGO */}
            <Text style={{ fontSize: 7 }}>LOGO</Text>
          </View>
          <View style={{ flex: 1, border: '1px solid #000', height: 40, justifyContent: 'center' }}>
            <Text style={styles.title}>REGISTRO DE PROVEEDOR</Text>
          </View>
          <View style={{ width: 90, border: '1px solid #000', height: 40, padding: 3 }}>
            <Text style={styles.small}>Código: F-S1-05</Text>
            <Text style={styles.small}>Versión: 04</Text>
          </View>
        </View>

        {/* INFORMACIÓN GENERAL */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>INFORMACIÓN GENERAL</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>NOMBRE O RAZÓN SOCIAL</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>NIT</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>NÚMERO D.V.</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>DIRECCIÓN</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>MUNICIPIO</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>DEPARTAMENTO</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>TELÉFONO</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>NOMBRE CONTACTO COMERCIAL</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>CELULAR</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>TELÉFONO</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>
                  INFORMACIÓN DPTO. CONTABLE, TESORERÍA Y/O FACTURACIÓN
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>NOMBRE CONTACTO</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>CELULAR</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>TELÉFONO</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.cell, { flex: 2 }]}>
                <Text style={styles.label}>TIPO DE ACTIVIDAD:</Text>
                <View style={styles.checkboxRow}>
                  <View style={styles.checkbox} />
                  <Text>DISTRIBUIDOR</Text>
                  <View style={styles.checkbox} />
                  <Text>INTERMEDIARIO</Text>
                  <View style={styles.checkbox} />
                  <Text>FABRICANTE</Text>
                  <View style={styles.checkbox} />
                  <Text>IMPORTADOR</Text>
                  <View style={styles.checkbox} />
                  <Text>SERVICIOS</Text>
                </View>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>DESCRIPCIÓN DEL PRODUCTO O SERVICIO A OFRECER</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>EXPERIENCIA</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>CÓDIGO CIIU</Text>
              </View>
            </View>
          </View>
        </View>

        {/* INFORMACIÓN COMERCIAL, FINANCIERA Y TRIBUTARIA */}
        <View style={[styles.sectionRow, { marginTop: 6 }]}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>INF. COMERCIAL, FINANCIERA Y TRIBUTARIA</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>CONDICIONES DE PAGO</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>CUENTA PARA PAGO POR TRANSFERENCIA ELECTRÓNICA</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>PLAZO</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>DESCUENTO %</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>ENTIDAD BANCARIA</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>No. DE CUENTA</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>TIPO CUENTA: AHORROS / CORRIENTE</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>RESPONSABLE IVA</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>CONTRIBUYENTE IMPUESTO RENTA</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>GRAN CONTRIBUYENTE</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>RÉGIMEN COMÚN / SIMPLIFICADO</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>RES. No.</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>FECHA</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>AUTORRETENEDOR</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>IMPUESTO INDUSTRIA Y COMERCIO</Text>
              </View>
            </View>
          </View>
        </View>

        {/* REFERENCIAS COMERCIALES */}
        <View style={[styles.sectionRow, { marginTop: 6 }]}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>REFERENCIAS COMERCIALES</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>CLIENTE</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>DIRECCIÓN</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>CONTACTO</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>CIUDAD</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>TELÉFONO</Text>
              </View>
            </View>
          </View>
        </View>

        {/* REPRESENTANTE LEGAL */}
        <View style={[styles.sectionRow, { marginTop: 6 }]}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>REP. LEGAL</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text style={styles.label}>NOMBRE REPRESENTANTE LEGAL</Text>
              </View>
              <View style={styles.cell}>
                <Text style={styles.label}>FIRMA</Text>
              </View>
            </View>
          </View>
        </View>

        {/* OTROS ANEXOS */}
        <View style={[styles.sectionRow, { marginTop: 6 }]}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>OTROS ANEXOS</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.cell}>
              <Text style={styles.small}>PERSONA JURÍDICA / PERSONA NATURAL</Text>
              <Text style={styles.small}>- Certificado de Existencia y Representación Legal</Text>
              <Text style={styles.small}>- Certificado RUT</Text>
              <Text style={styles.small}>- Certificación Cuenta Bancaria</Text>
              <Text style={styles.small}>- Evaluación SG-SST y pagos seguridad social</Text>
              <Text style={styles.small}>- Certificaciones del Sistema de Gestión (si aplica)</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.small, { marginTop: 6 }]}>
          IMPORTANTE: La documentación aquí listada corresponde a requisitos generales. Según el
          tipo de servicio y/o producto ofrecido, podrían requerirse documentos adicionales.
        </Text>
      </Page>
    </Document>
  );
}
