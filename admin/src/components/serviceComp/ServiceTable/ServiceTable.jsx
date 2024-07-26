import React, { useState, useEffect } from 'react';
import './ServiceTable.css';
import axios from 'axios';
import UpdateService from '../servicePopUp/ServicePopUp'; // Import your updateService component

const ServiceTable = () => {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get("https://vehicle-sever.onrender.com/allServices");
                setServices(response.data);
              
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        };

        fetchServices();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://vehicle-sever.onrender.com/deleteServices/${id}`);
            setServices(services.filter(service => service._id !== id));
            console.log("Service deleted successfully");
        } catch (error) {
            console.error("Error deleting service:", error);
        }
    };

    const handleEdit = (service) => {
        console.log(service);
        setSelectedService(service);
        openPop(service);
    };

    return (
        <div className='service'>     
            <div className="btblContainer">
                <div className='scrolltbl'>
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Service Title</th>
                                <th>Image</th>
                                <th>Estimated Hour</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service, index) => (
                                <tr key={index} className='rwhover'>
                                    <td><input className='ckbox' type='checkbox' name='all' /></td>
                                    <td>{service.serviceTitle}</td>
                                    <td style={{ width: '10rem' }}><img src={service.imagePath} className='service-images'/></td>
                                    <td>{service.estimatedHour}</td>
                                    <td>{service.details}</td>
                                    <td style={{ width: '8.5rem' }}>
                                        <button className='accept' onClick={() => handleEdit(service)}>Edit</button>
                                        <button className='delete' onClick={() => handleDelete(service._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedService && <UpdateService service={selectedService} closePop={() => setSelectedService(null)}  />}
        </div>
    );
}

export default ServiceTable;
