import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

import { PrintHeader } from 'src/components/pdf';

// ----------------------------------------------------------------------

interface Props {
  headerData: any;
  data: any;
}

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

export default function VendorPrint({ headerData, data }: Props) {
  const commercialContacts = data.contacts.filter((item: any) => item.typeContact === 'COMERCIAL');
  const accountantContacts = data.contacts.filter((item: any) => item.typeContact === 'CONTABLE');

  if (data.references.length === 0) data.references.push([{}], [{}], [{}], [{}]);
  else if (data.references.length === 1) data.references.push([{}], [{}], [{}]);
  else if (data.references.length === 2) data.references.push([{}], [{}]);
  else if (data.references.length === 3) data.references.push([{}]);

  const contactInfo = (contacts: any) => (
    <>
      {contacts.length > 0 &&
        contacts.map((item: any) => (
          <View style={styles.tableRow} wrap={false} key={item.PK}>
            <View style={[styles.tableCell, { width: '30%' }]}>
              <Text>{item.name}</Text>
            </View>
            <View style={[styles.tableCell, { width: '20%' }]}>
              <Text>{item.cellphone}</Text>
            </View>
            <View style={[styles.tableCell, { width: '20%' }]}>
              <Text>{item.phone}</Text>
            </View>
            <View style={[styles.tableCell, { width: '30%' }]}>
              <Text>{item.email}</Text>
            </View>
          </View>
        ))}

      {contacts.length === 0 && (
        <View style={styles.tableRow} wrap={false}>
          <View style={[styles.tableCell, { width: '30%', height: '15px' }]} />
          <View style={[styles.tableCell, { width: '20%', height: '15px' }]} />
          <View style={[styles.tableCell, { width: '20%', height: '15px' }]} />
          <View style={[styles.tableCell, { width: '30%', height: '15px' }]} />
        </View>
      )}
    </>
  );

  return (
    <Document>
      <Page size="LETTER" orientation="portrait" style={styles.page}>
        <PrintHeader title="INSCRIPCIÓN Y/O ACTUALIZACIÓN DE PROVEEDORES" data={headerData} />

        <View style={styles.table}>
          {/* INFORMACION GENERAL */}
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
                    width: '100px',
                    height: '100px',
                    transform: 'rotate(-90deg) translate(-60px, 6px)',
                  },
                ]}
              >
                {`INFORMACION\nGENERAL`}
              </Text>
            </View>
            <View style={{ width: '94%' }}>
              <View style={styles.tableRow} wrap={false}>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '70%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>
                    NOMBRE O RAZÓN SOCIAL
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '30%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>NIT</Text>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, { width: '70%' }]}>
                  <Text style={styles.textCentered}>{data.vendor.name}</Text>
                </View>
                <View style={[styles.tableCell, { width: '30%', padding: 0 }]}>
                  <View style={styles.tableRow} wrap={false}>
                    <View
                      style={[
                        styles.tableCell,
                        styles.headerCell,
                        styles.textCentered,
                        { width: '80%' },
                      ]}
                    >
                      <Text style={[styles.boldText, styles.headerCellText]}>NÚMERO</Text>
                    </View>
                    <View
                      style={[
                        styles.tableCell,
                        styles.headerCell,
                        styles.textCentered,
                        styles.noRightBorder,
                        { width: '20%' },
                      ]}
                    >
                      <Text style={[styles.boldText, styles.headerCellText]}>D.V.</Text>
                    </View>
                  </View>

                  <View style={styles.tableRow} wrap={false}>
                    <View style={[styles.tableCell, styles.noBottomBorder, { width: '80%' }]}>
                      <Text style={styles.textCentered}>{data.vendor.numberId}</Text>
                    </View>
                    <View
                      style={[
                        styles.tableCell,
                        styles.noBottomBorder,
                        styles.noRightBorder,
                        { width: '20%' },
                      ]}
                    >
                      <Text style={styles.textCentered}>{data.vendor.dv}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '30%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>DIRECCIÓN</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '25%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>MUNICIPIO</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '25%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>DEPARTAMENTO</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '20%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>TELÉFONO</Text>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, { width: '30%' }]}>
                  <Text>{data.vendor.address}</Text>
                </View>
                <View style={[styles.tableCell, { width: '25%' }]}>
                  <Text>{data.vendor.cityName}</Text>
                </View>
                <View style={[styles.tableCell, { width: '25%' }]}>
                  <Text>{data.vendor.departmentName}</Text>
                </View>
                <View style={[styles.tableCell, { width: '20%' }]}>
                  <Text>{data.vendor.phone}</Text>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, styles.textCentered, { width: '30%' }]}>
                  <Text style={[styles.boldText, styles.headerCellText]}>
                    NOMBRE DEL CONTACTO COMERCIAL
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.textCentered, { width: '20%' }]}>
                  <Text style={[styles.boldText, styles.headerCellText]}>CELULAR</Text>
                </View>
                <View style={[styles.tableCell, styles.textCentered, { width: '20%' }]}>
                  <Text style={[styles.boldText, styles.headerCellText]}>TELEFONO</Text>
                </View>
                <View style={[styles.tableCell, styles.textCentered, { width: '30%' }]}>
                  <Text style={[styles.boldText, styles.headerCellText]}>CORREO ELECTRÓNICO</Text>
                </View>
              </View>

              {contactInfo(commercialContacts)}

              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, styles.textCentered, { width: '100%' }]}>
                  <Text style={[styles.boldText, styles.headerCellText]}>
                    INFORMACION DPTO. CONTABLE, TESORERIA Y/O FACTURACION (Novedades con la
                    facturaciòn)
                  </Text>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, styles.textCentered, { width: '30%' }]}>
                  <Text style={[styles.boldText, styles.headerCellText]}>NOMBRE DEL CONTACTO</Text>
                </View>
                <View style={[styles.tableCell, styles.textCentered, { width: '20%' }]}>
                  <Text style={[styles.boldText, styles.headerCellText]}>CELULAR</Text>
                </View>
                <View style={[styles.tableCell, styles.textCentered, { width: '20%' }]}>
                  <Text style={[styles.boldText, styles.headerCellText]}>TELEFONO</Text>
                </View>
                <View style={[styles.tableCell, styles.textCentered, { width: '30%' }]}>
                  <Text style={[styles.boldText, styles.headerCellText]}>CORREO ELECTRÓNICO</Text>
                </View>
              </View>

              {contactInfo(accountantContacts)}

              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, styles.headerCell, { width: '20%' }]}>
                  <Text style={[styles.boldText, styles.headerCellText]}>TIPO DE ACTIVIDAD:</Text>
                </View>

                <View style={[styles.tableCell, { width: '80%' }]}>
                  <Text>{data.vendor.typeActivity}</Text>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '70%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>
                    DESCRIPCIÓN DEL PRODUCTO O SERVICIO A OFRECER
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '30%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>EXPERIENCIA</Text>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, { width: '70%' }]}>
                  <Text>{data.vendor.description}</Text>
                </View>
                <View style={[styles.tableCell, { width: '30%', padding: 0 }]}>
                  <View style={styles.tableRow} wrap={false}>
                    <View style={[styles.tableCell, styles.noRightBorder, { width: '100%' }]}>
                      <Text style={styles.textCentered}>{data.vendor.experience}</Text>
                    </View>
                  </View>

                  <View style={styles.tableRow} wrap={false}>
                    <View
                      style={[
                        styles.tableCell,
                        styles.headerCell,
                        styles.textCentered,
                        styles.noRightBorder,
                        { width: '100%' },
                      ]}
                    >
                      <Text style={[styles.boldText, styles.headerCellText]}>CÓDIGO CIIU</Text>
                    </View>
                  </View>

                  <View style={styles.tableRow} wrap={false}>
                    <View
                      style={[
                        styles.tableCell,
                        styles.noBottomBorder,
                        styles.noRightBorder,
                        { width: '100%' },
                      ]}
                    >
                      <Text style={styles.textCentered}>{data.vendor.ciiu}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* INFORMACIÓN COMERCIAL, FINANCIERA Y TRIBUTARIA */}
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
                    width: '125px',
                    height: '125px',
                    transform: 'rotate(-90deg) translate(-1px, 6px)',
                  },
                ]}
              >
                {`INFORMACIÓN COMERCIAL,\nFINANCIERA Y TRIBUTARIA`}
              </Text>
            </View>
            <View style={{ width: '94%' }}>
              <View style={styles.tableRow} wrap={false}>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '30%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>CONDICIONES DE PAGO</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '70%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>
                    CUENTA PARA PAGO POR TRANSFERENCIA ELECTRONICA
                  </Text>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '20%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>PLAZO</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '10%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>DCTO.</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '30%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>ENTIDAD BANCARIA</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '20%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>No. DE CUENTA</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '20%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>TIPO DE CUENTA</Text>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, { width: '20%' }]}>
                  <Text>{data.vendor.term}</Text>
                </View>
                <View style={[styles.tableCell, { width: '10%' }]}>
                  <Text style={styles.textCentered}>{data.vendor.discount}%</Text>
                </View>
                <View style={[styles.tableCell, { width: '30%' }]}>
                  <Text>{data.vendor.bank}</Text>
                </View>
                <View style={[styles.tableCell, { width: '20%' }]}>
                  <Text>{data.vendor.accountNumber}</Text>
                </View>
                <View style={[styles.tableCell, { width: '20%' }]}>
                  <Text>{data.vendor.accountType}</Text>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '30%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>RESPONSABLE I.V.A.</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '30%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>
                    CONTRIBUYENTE IMPORRENTA
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '40%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>GRAN CONTRIBUYENTE</Text>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, { width: '30%' }]}>
                  <Text style={styles.textCentered}>{data.vendor.ivaType}</Text>
                </View>
                <View style={[styles.tableCell, { width: '30%' }]}>
                  <Text style={styles.textCentered}>{data.vendor.incomeTaxPayer}</Text>
                </View>
                <View style={[styles.tableCell, { width: '40%' }]}>
                  <View style={styles.tableRow} wrap={false}>
                    <View style={[styles.paragraph, { width: '20%' }]}>
                      <Text style={styles.textCentered}>{data.vendor.bigTaxPayer}</Text>
                    </View>
                    <View style={[styles.paragraph, { width: '20%' }]}>
                      <Text>{`Res. No.\nFecha`}</Text>
                    </View>
                    <View style={[styles.paragraph, { width: '60%' }]}>
                      <Text>
                        {data.vendor.bigTaxPayer === 'SI'
                          ? `${data.vendor.resolutionBigTaxPayer}\n${data.vendor.dateBigTaxPayer.slice(0, 10)}`
                          : `_________\n_________`}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '40%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>AUTORRETENEDOR</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '60%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>
                    IMPUESTO DE INDUSTRIA Y COMERCIO
                  </Text>
                </View>
              </View>

              <View style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, { width: '40%' }]}>
                  <View style={styles.tableRow} wrap={false}>
                    <View style={[styles.paragraph, { width: '20%' }]}>
                      <Text style={styles.textCentered}>{data.vendor.selfRetaining}</Text>
                    </View>
                    <View style={[styles.paragraph, { width: '20%' }]}>
                      <Text>{`Res. No.\nFecha`}</Text>
                    </View>
                    <View style={[styles.paragraph, { width: '60%' }]}>
                      <Text>
                        {data.vendor.selfRetaining === 'SI'
                          ? `${data.vendor.resolutionSelfRetaining}\n${data.vendor.dateSelfRetaining.slice(0, 10)}`
                          : `_________\n_________`}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.tableCell, { padding: 0, width: '60%' }]}>
                  <View style={styles.tableRow} wrap={false}>
                    <View
                      style={[
                        styles.tableCell,
                        styles.headerCell,
                        styles.textCentered,
                        { width: '16.5%' },
                      ]}
                    >
                      <Text style={[styles.boldText, styles.headerCellText]}>RESP.</Text>
                    </View>
                    <View
                      style={[
                        styles.tableCell,
                        styles.headerCell,
                        styles.textCentered,
                        { width: '34%' },
                      ]}
                    >
                      <Text style={[styles.boldText, styles.headerCellText]}>MUNICIPIO</Text>
                    </View>
                    <View
                      style={[
                        styles.tableCell,
                        styles.headerCell,
                        styles.textCentered,
                        { width: '25.5%' },
                      ]}
                    >
                      <Text style={[styles.boldText, styles.headerCellText]}>COD. ACTIV</Text>
                    </View>
                    <View
                      style={[
                        styles.tableCell,
                        styles.headerCell,
                        styles.textCentered,
                        styles.noRightBorder,
                        { width: '25%' },
                      ]}
                    >
                      <Text style={[styles.boldText, styles.headerCellText]}>TARIFA</Text>
                    </View>
                  </View>

                  <View style={styles.tableRow} wrap={false}>
                    <View style={[styles.tableCell, styles.noBottomBorder, { width: '16.5%' }]}>
                      <Text style={styles.textCentered}>{data.vendor.industryTaxResponsible}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.noBottomBorder, { width: '34%' }]}>
                      <Text>{data.vendor.industryTaxCityName || ''}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.noBottomBorder, { width: '25.5%' }]}>
                      <Text>{data.vendor.industryTaxCode || ''}</Text>
                    </View>
                    <View
                      style={[
                        styles.tableCell,
                        styles.noBottomBorder,
                        styles.noRightBorder,
                        { width: '25%' },
                      ]}
                    >
                      <Text>{data.vendor.industryTaxRate || ''}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* REFERENCIAS COMERCIALES */}
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
                    width: '65px',
                    height: '65px',
                    transform: 'rotate(-90deg) translate(-1px, 6px)',
                  },
                ]}
              >
                {`REFERENCIAS\nCOMERCIALES`}
              </Text>
            </View>
            <View style={{ width: '94%' }}>
              <View style={styles.tableRow} wrap={false}>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '25%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>CLIENTE</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '25%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>DIRECCIÓN</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '20%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>CONTACTO</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '15%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>CIUDAD</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.headerCell,
                    styles.textCentered,
                    { width: '15%' },
                  ]}
                >
                  <Text style={[styles.boldText, styles.headerCellText]}>TELÉFONO</Text>
                </View>
              </View>

              {data.references.map((item: any) => (
                <View style={styles.tableRow} wrap={false} key={item.PK}>
                  <View style={[styles.tableCell, { width: '25%', height: '15px' }]}>
                    <Text>{item.client}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '25%', height: '15px' }]}>
                    <Text>{item.address}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '20%', height: '15px' }]}>
                    <Text>{item.contact}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '15%', height: '15px' }]}>
                    <Text>{item.cityName}</Text>
                  </View>
                  <View style={[styles.tableCell, { width: '15%', height: '15px' }]}>
                    <Text>{item.phone}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

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
                  <Text style={[styles.boldText]}>NOMBRE REPRESENTANTE LEGAL</Text>
                  <Text>{`\n${data.vendor.legalRepresentative}`}</Text>
                </View>
                <View style={[styles.tableCell, { width: '30%', height: '36px' }]}>
                  <Text style={[styles.boldText]}>FIRMA</Text>
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
