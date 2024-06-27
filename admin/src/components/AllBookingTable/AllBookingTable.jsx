import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import Search from '../BookingComp/Search/Search';
import './AllBookingTable.css'; 
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

function Table({ openModal }) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null); // State to manage selected booking for pop-up
  const [selectedStatus, setSelectedStatus] = useState('accepted'); // State to manage selected status
  const [filter, setFilter] = useState('All'); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/allBookingRequest');
        const acceptedData = response.data.filter(row => row.status !== 'pending');
        setData(acceptedData); // Set data to filtered data
        setFilteredData(acceptedData);
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
        row.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Function to handle opening the modal with row data
  const handleOpenModal = (rowData) => {
    openModal(rowData); // Pass the row data to openModal function
  };

  const handleDeleteRow = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/deleteBookingRequest/${id}`);
      // If deletion is successful, refetch data to update the table
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const openBookingDetails = (booking) => {
    setSelectedBooking(booking); // Set the selected booking to display its details
  };

  const closeBookingDetails = () => {
    setSelectedBooking(null); // Close the pop-up by resetting selected booking
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

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(`http://localhost:4000/updateBookingStatus2/${selectedBooking._id}`, { status: selectedStatus });
  
      // Update the status in the local state
      const updatedData = data.map(row => {
        if (row._id === selectedBooking._id) {
          return { ...row, status: selectedStatus };
        }
        return row;
      });
  
      setData(updatedData);
      setFilteredData(updatedData);
  
      closeBookingDetails();
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
    }
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
                  <button className='viewBtn' onClick={() => handleOpenModal(row)} ><VisibilityOutlinedIcon fontSize='small'/></button>
                  <button className='update' onClick={() => openBookingDetails(row)}>Update</button>
                    <button className='delete' onClick={() => handleDeleteRow(row._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedBooking && (
        <div className="poPup">
          <div className="poPup-inner">
           
            <h2>Update Booking Status</h2>
            <select className='updateStatusinput' value={selectedStatus} onChange={handleStatusChange}>
              <option value='accepted'>Accepted</option>
              <option value='pending'>Pending</option>
              <option value='completed'>Completed</option>
              <option value='cancelled'>Cancelled</option>
            </select>
          
            <button className="updatBtn" onClick={handleUpdateStatus}>Update</button>
            <button className="closeBtn" onClick={closeBookingDetails}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
