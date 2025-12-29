import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';

// ----------------------------------------------------------------------

interface Props {
  data?: any;
}

export function RequisitionPrint({ data }: Props) {
  const styles = StyleSheet.create({
    page: {
      backgroundColor: '#fff',
    },
    backgroundImage: {
      position: 'absolute',
      minWidth: '100%',
      minHeight: '100%',
      height: '100%',
      width: '100%',
      top: 0,
      left: 0,
    },
    headerContainer: {
      width: '100%',
      position: 'absolute',
      top: '0.5cm',
      left: 0,
      right: 0,
      height: 80,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: '#fff',
      marginHorizontal: '2cm',
    },
    headerImage: {
      width: '500px',
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
      fontSize: '12px',
    },
    secondHeader: {
      position: 'absolute',
      left: 0,
      marginHorizontal: '2cm',
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
    content: {
      flexGrow: 1,
    },
    footer: {
      width: '100%',
      position: 'absolute',
      bottom: 0,
      left: 0,
      borderStyle: 'solid',
      borderWidth: 2,
      borderRightWidth: 0,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
      padding: '0.6cm 1cm 1.4cm 1cm',
    },
    footerImageContainer: {
      width: '100px',
      position: 'absolute',
      top: 10,
      right: 20,
    },
    footerImage: {
      height: 25,
      objectFit: 'contain',
    },
    footerTitleContainer: {
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    footerTitle: {
      fontSize: '10px',
      color: '#000',
    },
    link: {
      color: '#000',
      textDecoration: 'none',
    },
    boldText: {
      fontWeight: 700,
    },
    textCentered: {
      textAlign: 'center',
    },
    textRight: {
      textAlign: 'right',
    },
  });

  // const isThereHeader = Boolean(data.order.urlHeader);
  // const isThereLogo = Boolean(data.order.urlLogo);

  // const renderBackground = (
  //   <Image src={data.order.urlHeader} style={styles.backgroundImage} fixed />
  // );

  // const firstHeader = (
  //   <View style={styles.headerContainer} fixed>
  //     <Image
  //       src={
  //         isThereLogo
  //           ? data.order.urlLogo
  //           : import.meta.env.VITE_BASE_URL + 'assets/imgs/qualitapp.png'
  //       }
  //       style={styles.headerImage}
  //     />
  //     <View style={styles.headerTitleContainer}>
  //       <Text style={styles.headerTitle}>{data.order.clientName}</Text>
  //     </View>
  //   </View>
  // );

  // const secondHeader = (
  //   <View style={[styles.secondHeader, { top: isThereHeader ? '80px' : '100px' }]} fixed>
  //     <View style={styles.footerTitleContainer}>
  //       <Text style={[styles.boldText, { fontSize: 14, marginBottom: '10px' }]}>
  //         Orden de producción No. {data.order.PK.substr(5)}
  //       </Text>
  //     </View>
  //     <View style={styles.table}>
  //       <View style={styles.tableRow} wrap={false}>
  //         <View style={[styles.tableCell, { width: '100%' }]}>
  //           <Text>
  //             <Text style={styles.boldText}>Nombre cliente: </Text>
  //             {data.order.clientName}
  //           </Text>
  //         </View>
  //       </View>
  //       <View style={styles.tableRow} wrap={false}>
  //         <View style={[styles.tableCell, { width: '100%' }]}>
  //           <Text>
  //             <Text style={styles.boldText}>Proyecto: </Text>
  //             {data.order.recipeName}
  //           </Text>
  //         </View>
  //       </View>
  //       <View style={styles.tableRow} wrap={false}>
  //         <View style={[styles.tableCell, { width: '50%' }]}>
  //           <Text>
  //             <Text style={styles.boldText}>Preparación: </Text>
  //             {data.order.dishName}
  //           </Text>
  //         </View>
  //         <View style={[styles.tableCell, { width: '50%' }]}>
  //           <Text>
  //             <Text style={styles.boldText}>Cantidad a preparar: </Text>
  //             {data.order.quantity}
  //           </Text>
  //         </View>
  //       </View>
  //       <View style={styles.tableRow} wrap={false}>
  //         <View style={[styles.tableCell, { width: '100%' }]}>
  //           <Text>
  //             <Text style={styles.boldText}>Autorizó: </Text>
  //             {data.order.approve}
  //           </Text>
  //         </View>
  //       </View>
  //       <View style={styles.tableRow} wrap={false}>
  //         <View style={[styles.tableCell, { width: '50%' }]}>
  //           <Text>
  //             <Text style={styles.boldText}>Fecha orden: </Text>
  //             {data.order.date ? data.order.date.slice(0, 10) : ''}
  //           </Text>
  //         </View>
  //         <View style={[styles.tableCell, { width: '50%' }]}>
  //           <Text>
  //             <Text style={styles.boldText}>Fecha vencimiento: </Text>
  //             {data.order.expirationDate ? data.order.expirationDate.slice(0, 10) : ''}
  //           </Text>
  //         </View>
  //       </View>
  //     </View>
  //   </View>
  // );

  // const footer = (
  //   <View style={styles.footer} fixed>
  //     <View style={styles.footerTitleContainer}>
  //       <Text style={styles.footerTitle}>
  //         Desarrollado por Qualitad SAS.
  //         <Text> </Text>
  //         <Link style={styles.link} href="http://www.qualitad.co/">
  //           www.qualitad.co
  //         </Link>
  //       </Text>
  //     </View>
  //     <View style={styles.footerImageContainer}>
  //       <Image
  //         src={import.meta.env.VITE_BASE_URL + 'assets/imgs/qualitapp.png'}
  //         style={styles.footerImage}
  //       />
  //     </View>
  //   </View>
  // );

  return (
    <Document>
      <Page
        size="LETTER"
        orientation="portrait"
        style={[styles.page, { paddingTop: '50px', paddingBottom: '50px' }]}
      >
        {/* {isThereHeader && renderBackground}
        {!isThereHeader && firstHeader}
        {secondHeader}

        <View style={[styles.content, { marginHorizontal: '2cm' }]}>
          <View style={styles.table}>
            <View style={styles.tableRow} wrap={false}>
              <View
                style={[styles.tableCell, styles.headerCell, styles.textCentered, { width: '30%' }]}
              >
                <Text style={[styles.boldText, styles.headerCellText]}>Código</Text>
              </View>
              <View
                style={[styles.tableCell, styles.headerCell, styles.textCentered, { width: '40%' }]}
              >
                <Text style={[styles.boldText, styles.headerCellText]}>Nombre</Text>
              </View>
              <View
                style={[styles.tableCell, styles.headerCell, styles.textCentered, { width: '30%' }]}
              >
                <Text style={[styles.boldText, styles.headerCellText]}>Cantidad</Text>
              </View>
              <View
                style={[styles.tableCell, styles.headerCell, styles.textCentered, { width: '30%' }]}
              >
                <Text style={[styles.boldText, styles.headerCellText]}>Unidad de medida</Text>
              </View>
            </View>

            {data.items.map((item: any) => (
              <View key={item.SK} style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCell, { width: '30%' }]}>
                  <Text>{item.ingredientCode}</Text>
                </View>
                <View style={[styles.tableCell, { width: '40%' }]}>
                  <Text>{item.ingredientName}</Text>
                </View>
                <View style={[styles.tableCell, { width: '30%' }]}>
                  <Text>{item.quantity}</Text>
                </View>
                <View style={[styles.tableCell, { width: '30%' }]}>
                  <Text>{item.ingredientUnit}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {footer} */}

        <View style={[styles.content, { marginHorizontal: '2cm' }]}>
          <Image
            src={import.meta.env.VITE_BASE_URL + 'assets/imgs/encabezado.png'}
            style={styles.headerImage}
          />

          <View style={[styles.table, { marginTop: '10px' }]}>
            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: '50%' }]}>
                <Text>
                  <Text style={styles.boldText}>Ciudad y fecha: </Text>
                  {data.requisition.cityName} {data.requisition.createdAt.slice(0, 10)}
                </Text>
              </View>
              <View style={[styles.tableCell, { width: '50%' }]}>
                <Text>
                  <Text style={styles.boldText}>Requisición #: </Text>
                  {data.requisition.PK.match(/\d+/g)[0]}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: '50%' }]}>
                <Text>
                  <Text style={styles.boldText}>Solicitante: </Text>
                  {data.requisition.applicantName}
                </Text>
              </View>
              <View style={[styles.tableCell, { width: '50%' }]}>
                <Text>
                  <Text style={styles.boldText}>Proceso: </Text>
                  {data.requisition.proccessName}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: '50%' }]}>
                <Text>
                  <Text style={styles.boldText}>Lugar de entrega: </Text>
                  {data.requisition.deliveryPlace}
                </Text>
              </View>
              <View style={[styles.tableCell, { width: '50%' }]}>
                <Text>
                  <Text style={styles.boldText}>Código proyecto: </Text>
                  {data.requisition.costCenterCode}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCell, { width: '100%' }]}>
                <Text>
                  <Text style={styles.boldText}>Nombre proyecto: </Text>
                  {data.requisition.costCenterName}
                </Text>
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
        </View>
      </Page>
    </Document>
  );
}
