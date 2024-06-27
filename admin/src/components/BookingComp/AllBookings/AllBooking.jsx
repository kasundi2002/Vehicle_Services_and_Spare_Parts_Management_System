import React from 'react';
import { useState } from 'react';
import BNavBar from '../BookingNavBar/BNavBar';
import AllBookingTable from '../../AllBookingTable/AllBookingTable';
import './AllBooking.css';
import Modal from '../popUpform/Modal';

function AllBooking() {
  const [modalOpen, setModalOpen] = useState(false);
  const [rowData, setRowData] = useState(null); // State to hold row data

  return (
    <div className='wrapContent-AllBooking'>
      <BNavBar />
      <AllBookingTable openModal={(rowData) => { // Pass rowData to openModal
        setRowData(rowData); // Set rowData state
        setModalOpen(true);
      }} />
      {/* Pass rowData to Modal component */}
      {modalOpen && <Modal closeModal={() => { setModalOpen(false) }} rowData={rowData} />}
    </div>
  );
}

export default AllBooking;
