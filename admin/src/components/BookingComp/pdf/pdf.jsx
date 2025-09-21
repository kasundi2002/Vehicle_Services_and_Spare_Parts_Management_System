import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer , Image } from '@react-pdf/renderer';
import axios from 'axios';
import './pdf.css';
import ImageLogo from '../../../assets/newlogo.png';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 20,
    display: 'flex',
  },
  section: {
    marginBottom: 1,
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
    color: '#04355b',
    padding: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  leftSubTopic: {
    fontSize: 11,
    marginBottom: 5,
    color: '#04355b',
    padding: 1,
    textAlign: 'left',
  },
  rightsubTopic: {
    fontSize: 10,
    marginBottom: 5,
    color: '#04355b',
    padding: 1,
    textAlign: 'left',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'gray',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,

  },
  tableRow: { flexDirection: 'row', fontSize: 12 , display: 'table-row', },
  tableColHeader: { width: '20%', borderStyle: 'solid', borderColor: 'gray', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 , padding: 5, textAlign: 'center', fontSize: 10, fontWeight: 'bold', backgroundColor: '#1c649f',color: 'white'},
  tableCol: { width: '25%', borderStyle: 'solid',borderColor: 'lightgray', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 , padding: 5, textAlign: 'center' , fontSize: 10 },
  logo: { width: 100, height: 80, position:'absolute', marginTop: 20 , marginLeft: 450 }, // Style for the image
  horizontalLine: { borderBottom: 1, borderBottomColor: '#04355b', marginTop: 5, marginBottom: 5 },
});

function PdfView({ startDate, endDate, dropDownValue }) {
  const [bookingData, setBookingData] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://vehicle-sever.onrender.com/allBookingRequest');
        setBookingData(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter the booking data based on the date range
  const filteredData = bookingData.filter((row) => {
    const bookingDate = new Date(row.date);
    const statusMatch = dropDownValue === 'All' || row.status === dropDownValue;
    return bookingDate >= new Date(startDate) && bookingDate <= new Date(endDate) && statusMatch;
  });
  

  const MyDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Booking Report</Text>
          <Image src={ImageLogo} style={styles.logo} /> 
          <Text style={styles.leftSubTopic}>Service Type: {dropDownValue}</Text>
          <Text style={styles.leftSubTopic}>Total Bookings:  {filteredData.length}</Text>
          <Text style={styles.rightsubTopic}>Start Date:  {startDate}</Text>
          <Text style={styles.rightsubTopic}>End Date:  {endDate}</Text>
          <View style={styles.horizontalLine}></View>
          
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>Bid</Text>
            <Text style={styles.tableColHeader}>Name</Text>
            <Text style={styles.tableColHeader}>Service Type</Text>
            <Text style={styles.tableColHeader}>Email</Text>
            <Text style={styles.tableColHeader}>Date</Text>
            <Text style={styles.tableColHeader}>Time</Text>
            <Text style={styles.tableColHeader}>Status</Text>
          </View>
          {filteredData.map((row) => (
            <View style={styles.tableRow} key={row._id}>
              <Text style={styles.tableCol}>{row.bookingId}</Text>
              <Text style={styles.tableCol}>{row.ownerName}</Text>
              <Text style={styles.tableCol}>{row.serviceType}</Text>
              <Text style={styles.tableCol}>{row.email}</Text>
              <Text style={styles.tableCol}>{formatDate(row.date)}</Text>
              <Text style={styles.tableCol}>{row.time}</Text>
              <Text style={styles.tableCol}>{row.status}</Text>
              
            </View>
          ))}
          
        </View>
      </Page>
    </Document>
  );

  return (
    <PDFViewer style={{ width: '100%', height: '100%' }}>
      {MyDocument}
    </PDFViewer>
  );
}

export default PdfView;
