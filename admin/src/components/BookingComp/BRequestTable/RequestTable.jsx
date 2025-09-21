import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RequestTable.css';
import Search from '../Search/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {QRCodeSVG} from 'qrcode.react';
import { QRCodeCanvas } from 'qrcode.react';


function Table() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null); // State to manage selected booking for pop-up
  const [qrCodeData, setQRCodeData] = useState(null); // State to store QR code data
  const [filter, setFilter] = useState('All'); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://vehicle-sever.onrender.com/allBookingRequest');
        
        // Filter pending bookings
        const pendingBookings = response.data.filter(row => row.status === 'pending');
        
        setData(pendingBookings);
        setFilteredData(pendingBookings);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchData();
  }, []);



  const handleSearch = (searchTerm) => {
    const filteredRows = data.filter((row) => {
      // Customize this logic based on your search requirements
      return (
        row.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredData(filteredRows);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const handleDeleteRow = async (id) => {
    try {
      // Send a DELETE request to your backend API endpoint
      await axios.delete(`https://vehicle-sever.onrender.com/deleteBookingRequest/${id}`);
  
      // If the request is successful, update the state to remove the deleted row
      setData(data.filter(row => row._id !== id));
      setFilteredData(filteredData.filter(row => row._id !== id ));
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };
  

  
    const handleUpdateStatus = async (id) => {
      try {
        // Send a PUT request to your backend API endpoint to update the status
        await axios.put(`https://vehicle-sever.onrender.com/updateBookingStatus2/${id}`, { status: 'accepted' });

        // If the request is successful, update the state to reflect the updated status
        setData(data.map(row => {
          if (row._id === id) {
            return { ...row, status: 'accepted' };
          }
          return row;
        }));

        setFilteredData(filteredData.map(row => {
          if (row._id === id) {
            return { ...row, status: 'accepted' };
          }
          return row;
        }));
        window.location.reload();
      } catch (error) {
        console.error('Error updating status:', error);
      }
    };


    const openBookingDetails = (booking) => {
      setSelectedBooking(booking); // Set the selected booking to display its details
    };
  
    const closeBookingDetails = () => {
      setSelectedBooking(null); // Close the pop-up by resetting selected booking
    };

    // Function to generate QR code data
  const generateQRCode = (booking) => {
    // Generate QR code data based on booking details
    const qrData = {
      ownerName: booking.ownerName,
      serviceType: booking.serviceType,
      phone: booking.phone,
      email: booking.email,
      date: booking.date,
      time: booking.time,
      status: booking.status
    };
    setQRCodeData(qrData); // Set QR code data to state

  };

  useEffect(() => {
    applyFilter(filter);
  }, [filter, data]);

  const applyFilter = (filter) => {
    if (filter === 'All') {
      setFilteredData(data);
    } else {
      const filteredRows = data.filter((row) => row.status === filter.toLowerCase());
      setFilteredData(filteredRows);
    }
  };

  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setFilter(selectedFilter);
  };


  return (
    <div className='booking'>
      <div className="tblContainer">
        <div className='line-one'>
        <select className='myselect' name='Filter' onChange={handleFilterChange }>
            <option value='All'>All</option>
            <option value='accepted'>Accepted</option>
            <option value='pending'>Pending</option>
            <option value='completed'>Completed</option>
            <option value='cancelled'>Cancelled</option>
          </select>
          <Search handleSearch={handleSearch}/>
          <button className='gReportbtn'>Generate Report</button>
        </div>
        <div className='scroll'>
          <table className='bookingList'> 
            <thead>
              <tr>
                <th>Bid</th>
                <th>Name</th>
                <th>Service Type</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row._id}>
                  <td>{row.bookingId}</td>
                  <td>{row.ownerName}</td>
                  <td>{row.serviceType}</td>
                  <td>{row.phone}</td>
                  <td>{row.email}</td>
                  <td>{formatDate(row.date)}</td>
                  <td>{row.time}</td>
                  <td>{row.status}</td>
                  <td>
                  <button className='viewBtn' onClick={() => openBookingDetails(row)}><VisibilityOutlinedIcon fontSize='small'/></button>
                    <button className='accept' onClick={() => handleUpdateStatus(row._id)} >Accept</button>
                    <button className='delete' onClick={() => handleDeleteRow(row._id)}>Reject</button>
                    <button className='generateQR' onClick={() => generateQRCode(row)}>Generate QR</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedBooking && (
        <div className="popup">
          <div className="popup-inner">
            <h2>Booking Details</h2>
            <p><strong>Name:</strong> {selectedBooking.ownerName}</p>
            <p><strong>Service Type:</strong> {selectedBooking.serviceType}</p>
            <p><strong>Phone:</strong> {selectedBooking.phone}</p>
            <p><strong>Email:</strong> {selectedBooking.email}</p>
            <p><strong>Date:</strong> {formatDate(selectedBooking.date)}</p>
            <p><strong>Time:</strong> {selectedBooking.time}</p>
            <p><strong>Status:</strong> {selectedBooking.status}</p>
            <button className="closeBtn" onClick={closeBookingDetails}>Close</button>
          </div>
        </div>
      )}
      {qrCodeData && (
        <div className="popup">
          <div className="popup-inner">
            <h1>QR Code</h1>
            <QRCodeCanvas value={JSON.stringify(qrCodeData)} /> {/* Convert data to string */}
            <button className="SaveBtn" >Download</button>
            <button className="closeBtn" onClick={() => setQRCodeData(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
