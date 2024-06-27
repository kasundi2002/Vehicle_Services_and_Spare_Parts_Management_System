// Form.js
import React, { useState } from 'react';
import './BookingForm.css'; // Import your CSS file
import axios from "axios"; // Import Axios for making HTTP requests

const Form = () => {
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    phone: '',
    specialNotes: '',
    mechanic: '',
    location: '',
    serviceType: '',
    vehicleModel: '',
    vehicleNumber: '',
    date: '',
    time: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

   

    try {
      // Send form data to backend server
      await axios.post("http://localhost:4000/addbooking", formData);
      alert("Booking submitted successfully!");
      // Optionally, reset the form after submission
      setFormData({
        ownerName: "",
        email: "",
        phone: "",
        location: "",
        specialNotes: "",
        serviceType: "",
        vehicleModel: "",
        date: "",
        time: ""
      });
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("An error occurred while submitting the booking.");
    }
  };


  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-columns">
          <div className="form-column">
            <h3>OWNER DETAILS</h3>
            <label>Name:</label>
            <input
              type="text"
              name="ownerName"
              placeholder="Enter your name"
              value={formData.ownerName}
              onChange={handleInputChange}
            />
            <label>Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <label>Phone:</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <label>Special Notes:</label>
            <textarea
              name="specialNotes"
              placeholder="Any special notes or instructions?"
              value={formData.specialNotes}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          <div className="form-column">
            <h3>VEHICLE DETAILS</h3>
            {/* Location */}
            <div className="form-group">
              <label>Location:</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Location</option>
                <option value="Anuradhapura">Anuradhapura</option>
                <option value="Malabe">Malabe</option>
                <option value="Colombo">Colombo</option>
              </select>
            </div>
            {/* Service Type */}
            <div className="form-group">
              <label>Service Type:</label>
              <select 
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                required>
          
                <option value="Body Wash">Body Wash</option>
                <option value="Engine Tune ups">Engine Tune ups</option>
                <option value="Spare Parts Replacement">Spare Parts Replacement</option>
              </select>
            </div>
            <label>Vehicle Model:</label>
            <input 
              type="text"
              name="vehicleModel"
              placeholder="Enter your vehicle model"
              value={formData.vehicleModel} 
              onChange={handleInputChange}
              required
            />
            <label>Vehicle Number:</label>
            <input 
              type="text"
              name="vehicleNumber"
              placeholder="Enter your vehicle number"
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
              required
            />
            <label>Time:</label>
            <input 
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        <button className='bSubmitBTN' type="submit">Book Now</button>
      </form>
    </div>
  );
};

export default Form;
