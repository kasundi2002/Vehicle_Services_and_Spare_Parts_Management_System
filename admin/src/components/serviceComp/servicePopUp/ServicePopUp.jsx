import React, { useState, useEffect } from 'react';
import axios from 'axios';
import upload_img from "../../../assets/upload_img.png";
import './ServicePopUP.css';

const updateService = ({ service, closePop }) => {
  const [image, setImage] = useState(null);
    const [editedService, setEditedService] = useState({
        serviceTitle: '',
        image: "",
        estimatedHour: '',
        details: '',
    });

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      setImage(file);
    };

    useEffect(() => {
        if (service) {
            setEditedService(service);
        }
    }, [service]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedService({ ...editedService, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            // Update service details on the backend
            await axios.put(`https://vehicle-sever.onrender.com/updateService/${editedService._id}`, editedService);
            closePop(null); // Close the popup
            window.location.reload(); // Reload the page to reflect changes
        } catch (error) {
            console.error("Error updating service:", error);
        }
    };

    const handleCancel = () => {
      closePop(null); // Close the popup
    };
    
    return (
        <div>
          <div className="fontainer">
            <div className="f-container">
            <div className="add-image">
            <label htmlFor="file-input">
              <img
                src={image ? URL.createObjectURL(image) : editedService.imagePath || upload_img}
                className="addService-thumbnail"
                alt="Upload Thumbnail"
              />
            </label>
            <input
              onChange={handleImageChange}
              type="file"
              name="image"
              id="file-input"
              hidden={true}
            />
          </div>
                <label className="lab">Service Title:</label>
                <input
                    type="text"
                    name="serviceTitle"
                    required
                    value={editedService.serviceTitle}
                    onChange={handleChange}
                />

                <label className="lab">Estimated Hour:</label>
                <input
                    type="text"
                    name="estimatedHour"
                    required
                    value={editedService.estimatedHour}
                    onChange={handleChange}
                />

                <label className="lab">Special Notes:</label>
                <textarea
                    name="details"
                    placeholder="Any special notes or instructions?"
                    value={editedService.details}
                    onChange={handleChange}
                    required
                ></textarea>

                <button onClick={handleSubmit} className="buttons" type="submit">
                    Update
                </button>
                <button className="cancel-bTn" type="submit" onClick={handleCancel}>
                  Cancel
                </button>
            </div>
        </div>
        </div>
    );
};

export default updateService;
