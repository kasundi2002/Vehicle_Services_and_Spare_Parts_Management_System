import React, { useState, useEffect } from 'react';
import './MyServices.css';
import img1 from '../../assets/myServices/bodyWash.png';
import axios from 'axios';

function MyServices() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Make a GET request to your backend server to fetch the services data
        const response = await axios.get('https://vehicle-sever.onrender.com/allServices');
        // Update the services state with the fetched data
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    // Call the fetchServices function when the component mounts
    fetchServices();
  }, []);

  return (
    <div>
      <section>
        <div className='container'>
          <div className='cards'>
            {services.map((service) => (
              <div key={service._id} className='card'>
                <img className="img" src={service.imagePath} alt="" />
                <h2>{service.serviceTitle}</h2>
                <p>{service.details}</p>
                <p>{service.estimatedHour}</p>
                <button className='btn'>Book Now</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default MyServices;
