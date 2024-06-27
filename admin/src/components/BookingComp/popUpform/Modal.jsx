import React, { useState, useEffect } from 'react';
import './Modal.css';
import axios from 'axios';

const Modal = ({ closeModal, rowData }) => {
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    phone: '',
    specialNotes: '',
    status: '',
    mechanic: '',
    location: '',
    serviceType: '',
    vehicleModel: '',
    vehicleNumber: '',
    date: '',
    time: '',
  });

  // Set initial form data when rowData changes
  useEffect(() => {
    if (rowData) {
      setFormData(rowData);
    }
  }, [rowData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:4000/updateBookingDetails/${formData._id}`, formData);
      console.log(response.data); // Handle success response
      // Close the modal or show a success message
      alert('Booking updated successfully');
      closeModal();
    } catch (error) {
      console.error(error); // Handle error response
      // Show an error message to the user
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className='modal-container' onClick={(e) => {
      if (e.target.className === 'modal-container') closeModal();
    }}>
      <div className="formContainer">
      <form onSubmit={handleSubmit}>
        <p>Booking ID: {formData.bookingId}</p>
        <div className="form-columns">
          <div className="form-column">
            <h3 style={{ color: '#007CB1' }}>OWNER DETAILS</h3>
            
            <label>Name:</label>
            <input
              type="text"
              name="ownerName"
              placeholder="Name"
              value={formData.ownerName}
              onChange={handleInputChange}
            />

            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <label>Phone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />

            <label>Special Notes:</label>
            <textarea
              name="specialNotes"
              value={formData.specialNotes}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>

          <div className="form-column">
            <h3 style={{ color: '#007CB1' }}>VEHICLE DETAILS</h3>
            <label>Location:</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
            <label>Service Type:</label>
            <input
              type="text"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleInputChange}
              required
            />
            <label>Vehicle Model:</label>
            <input
              type="text"
              name="vehicleModel"
              value={formData.vehicleModel}
              onChange={handleInputChange}
              required
            />
            <label>Vehicle Number:</label>
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleInputChange}
              required
            />
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              readOnly // Add readOnly attribute to disable editing
              required
            />
            <label>Time:</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              readOnly // Add readOnly attribute to disable editing
              required
            />
          </div>
        </div>
        <div className="button-container">
          <button type="submit">Update Booking</button>
          
        </div>
        </form>
      </div>
    </div>
  );
}

export default Modal;
