import React, { useState } from 'react';
import BNavBar from '../BookingNavBar/BNavBar';
import './report.css';
import PdfView from '../pdf/pdf';

function Report() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dropDownValue, setDropDownValue] = useState('All');

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };
  const handleDropDownChange = (e) => {
    setDropDownValue(e.target.value);
  }

  return (
    <div className='wrapContent-Report'>
      <BNavBar />

      <div className='booking-report'>
        <div className='report-generator'>
          <select className='myselect' name='Filter' onChange={handleDropDownChange}>
            <option value='All'>All</option>
            <option value='accepted'>Accepted</option>
            <option value='pending'>Pending</option>
            <option value='completed'>Completed</option>
            <option value='cancelled'>Cancelled</option>
          </select>
          <h3>Start Date :</h3>
          <input type='date' name='start-date' onChange={handleStartDateChange} />
          <h3>End Date :</h3>
          <input type='date' name='end-date' onChange={handleEndDateChange} />
         
          <button className='download-btn'>Download Pdf</button>
        </div>

        <div className='pdfContainer'>
          <PdfView startDate={startDate} endDate={endDate} dropDownValue={dropDownValue} />
        </div>
      </div>
    </div>
  );
}

export default Report;
