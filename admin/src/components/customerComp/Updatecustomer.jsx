import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";


const UpdateCustomerForm = () => {
    const {id} = useParams()

    console.log("sd",id)

    const [cusData, setCusData] = useState({
        name: "",
        NIC: "",
        address: "",
        contactno: "",
        email: "",
        vType: "",
        vName: "",
        Regno: "",
        vColor: "",
        vFuel: "",
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
         axios.get(`http://localhost:4000/customers/${id}`)
            .then((res) => {
                setCusData(res.data);
            })
            .catch(() => {
                console.log("Error while fetching data");
            });
    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setCusData({
            ...cusData,
            [name]: value,
        });
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        axios.put(`http://localhost:4000/customers/${cusData._id}`, cusData)
            .then(() => {
                setIsEditing(false);
                alert("Update successful");

            })
            .catch(() => {
                console.log("Error while saving data");
                
            });
    };

    return (
        <div className="container1 mt-5">
            <h2 className="cReg">Update Details</h2>
            <div className="row mt-5">
                <div className="col mt-3">
                    <label htmlFor="detais mt-3"><h4>Customer Details</h4></label>
                    <div className="col mt-3">
                        <label htmlFor="cname">Full Name</label>
                        <input type="text" className="form-control" name="name" id="name" defaultValue={cusData.name} onChange={handleInputChange} disabled={!isEditing} />
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="cnic">NIC:</label>
                        <input type="text" className="form-control" name="NIC" id="NIC" defaultValue={cusData.NIC} onChange={handleInputChange} disabled={!isEditing}/>
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="caddress">Address:</label>
                        <input type="text" className="form-control" name="address" id="address" defaultValue={cusData.address} onChange={handleInputChange} disabled={!isEditing}/>
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="cemail">Email Address:</label>
                        <input type="email" className="form-control" name="email" id="email" defaultValue={cusData.email} onChange={handleInputChange} disabled={!isEditing}/>
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="cno">Contact Number:</label>
                        <input type="number" className="form-control" name="contactno" id="contactno" defaultValue={cusData.contactno} onChange={handleInputChange} disabled={!isEditing}/>
                    </div>

                </div>

                <div className="col mt-3">
                    <label htmlFor="details mt-2"><h4>Vehicle Details</h4></label>
                    <div className="col mt-3">
                        <label htmlFor="vtype">Vehicle Type:</label>
                        <input type="text" className="form-control" name="vType" id="vType" defaultValue={cusData.vType} onChange={handleInputChange} disabled={!isEditing}/>
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="vname">Vehicle Name:</label>
                        <input type="text" className="form-control" name="vName" id="vName" defaultValue={cusData.vName} onChange={handleInputChange} disabled={!isEditing}/>
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="vregno">Registration Number:</label>
                        <input type="text" className="form-control" name="Regno" id="Regno" defaultValue={cusData.Regno} onChange={handleInputChange} disabled={!isEditing}/>
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="vcolor">Color:</label>
                        <input type="text" className="form-control" name="vColor" id="vColor" defaultValue={cusData.vColor} onChange={handleInputChange} disabled={!isEditing}/>
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="vftype">Fuel Type:</label>
                        <input type="text" className="form-control" name="vFuel" id="vFuel" defaultValue={cusData.vFuel} onChange={handleInputChange} disabled={!isEditing}/>
                    </div>

                </div>

            </div>

            <div className="button-container">
                {isEditing ? (
                    <button className="save-btn" onClick={handleSave}>Save</button>
                ) : (
                    <button className="edit-btn" onClick={handleEdit}>Edit</button>
                )}
            </div>

        </div>
    )
}

export default UpdateCustomerForm
