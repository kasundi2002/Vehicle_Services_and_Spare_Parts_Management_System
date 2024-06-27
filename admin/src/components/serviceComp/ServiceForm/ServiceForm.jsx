import React, { useState } from "react";
import "./ServiceForm.css";
import upload_img from "../../../assets/upload_img.png";

const AddService = () => {
  const [image, setImage] = useState(null);

  const [service, setService] = useState({
    serviceTitle: "",
    image: "",
    estimatedHour: "",
    details: "",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setService({ ...service, [name]: value });
  };

  const handleSubmit = async (event) => {
    let responseData;
    let serviceDet = service;

    let formData = new FormData();
    formData.append('product', image);

    await fetch('http://localhost:4000/upload', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    }).then((resp) => resp.json()).then((data) => { responseData = data })

    if (responseData.success) {
      serviceDet.image = responseData.image_url;
      console.log(serviceDet);
      await fetch('http://localhost:4000/addservice', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceDet),
      }).then((resp) => resp.json()).then((data) => {
        data.success ? alert("Service added successfully!") : alert("Service added Failed")
      })
    }
  };
  return (
    <div>
      <div className="f-container">
          <div className="add-image">
            <label htmlFor="file-input">
              <img
                src={image ? URL.createObjectURL(image) : upload_img}
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
            value={service.serviceTitle}
            onChange={handleChange}
          />

          <label className="lab">Estimated Hour:</label>
          <input
            type="text"
            name="estimatedHour"
            required
            value={service.estimatedHour}
            onChange={handleChange}
          />

          <label className="lab">Special Notes:</label>
          <textarea
            name="details"
            placeholder="Any special notes or instructions?"
            value={service.details}
            onChange={handleChange}
            required
          ></textarea>

          <button onClick={handleSubmit} className="buttons" type="submit">
            Add Service
          </button>
      </div>
    </div>
  );
};

export default AddService;
