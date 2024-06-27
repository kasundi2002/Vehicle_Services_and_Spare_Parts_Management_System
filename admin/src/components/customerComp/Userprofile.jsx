import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { useNavigate, useParams } from "react-router-dom";


const Userprofile = () => {
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
        <div className="profile">
            <header>
                <nav className="navbar navbar-expand-lg bg-primary">
                    <div className="container-fluid">
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item">
                                    <a className="nav-link active" aria-current="page" href="#">HOME</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link text-white" href="#">SERVICES</a>
                                </li>
                                <li className="nav-item">
                                    <Link to="/promolist" className="nav-link text-white" href="#">PROMOTIONS</Link>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link text-white" href="#">CONTACT US</a>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-danger">SHOP NOW</button>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-danger">BOOK NOW</button>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-danger">EMERGENCY</button>
                                </li>

                            </ul>
                            <div className="search" >
                                <form class="d-flex" role="search">
                                    <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                                    <button class="btn btn-success" type="submit">Search</button>
                                </form>
                            </div>

                        </div>
                    </div>
                </nav>
            </header>


            <div className="container light-style flex-grow-1 container-p-y mt-5">
                <h4 className="font-weight-bold py-3 mb-2" align="center">
                    My Profile
                </h4>
                <div className="card overflow-hidden">
                    <div className="row no-gutters row-bordered row-border-light">
                        <div className="col-md-3 pt-0">
                            <h4 className="col mt-3" align="center">Hello, {cusData.name}</h4>
                            <div className="card-body media align-items-center">
                                <img src="https://bootdey.com/img/Content/avatar/avatar1.png"
                                    className="d-block ui-w-80 rounded-circle" />
                            </div>
                            <div class="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                                <button class="nav-link active" id="v-pills-cDetails-tab" data-bs-toggle="pill" data-bs-target="#v-pills-cDetails" type="button" role="tab" aria-controls="v-pills-cDetails" aria-selected="true">Personal Details</button>
                                <button class="nav-link" id="v-pills-vDetails-tab" data-bs-toggle="pill" data-bs-target="#v-pills-vDetails" type="button" role="tab" aria-controls="v-pills-vDetails" aria-selected="false">Vehicle Details</button>
                                <button class="nav-link" id="v-pills-sDetails-tab" data-bs-toggle="pill" data-bs-target="#v-pills-sDetails" type="button" role="tab" aria-controls="v-pills-sDetails" aria-selected="false">Service Details</button>
                                <button class="nav-link" id="v-pills-notification-tab" data-bs-toggle="pill" data-bs-target="#v-pills-notification" type="button" role="tab" aria-controls="v-pills-notification" aria-selected="false">Notification</button>
                            </div>
                        </div>
                        <div className="col-md-9">
                            <div className="tab-content">
                                <div className="tab-pane fade active show" id="account-general">
                                    <hr className="border-light m-0" />
                                    <div class="tab-content" id="v-pills-tabContent">
                                        <div class="tab-pane fade show active" id="v-pills-cDetails" role="tabpanel" aria-labelledby="v-pills-cDetails-tab" tabindex="0">
                                            <div className="col mt-3">
                                                <label htmlFor="cname">Full Name:</label>
                                                <input type="text" className="form-control" name="name" id="name" defaultValue={cusData.name} onChange={handleInputChange} disabled={!isEditing} />
                                            </div>
                                            <div className="col mt-3">
                                                <label htmlFor="cnic">NIC:</label>
                                                <input type="text" className="form-control" name="NIC" id="NIC" defaultValue={cusData.NIC} onChange={handleInputChange} disabled={!isEditing} />
                                            </div>
                                            <div className="col mt-3">
                                                <label htmlFor="caddress">Address:</label>
                                                <input type="text" className="form-control" name="address" id="address" defaultValue={cusData.address} onChange={handleInputChange} disabled={!isEditing} />
                                            </div>

                                            <div className="col mt-3">
                                                <label htmlFor="cemail">Email Address:</label>
                                                <input type="email" className="form-control" name="email" id="email" defaultValue={cusData.email} onChange={handleInputChange} disabled={!isEditing} />
                                            </div>

                                            <div class="col mt-3">
                                                <label htmlFor="cno">Contact Number:</label>
                                                <input type="number" className="form-control" name="contactno" id="contactno" defaultValue={cusData.contactno} onChange={handleInputChange} disabled={!isEditing} />
                                            </div>
                                        </div>
                                        <div class="tab-pane fade" id="v-pills-vDetails" role="tabpanel" aria-labelledby="v-pills-vDetails-tab" tabindex="0">
                                            <div className="col mt-3">
                                                <label htmlFor="vtype">Vehicle Type:</label>
                                                <input type="text" className="form-control" name="vType" id="vType" defaultValue={cusData.vType} onChange={handleInputChange} disabled={!isEditing} />
                                            </div>

                                            <div class="col mt-3">
                                                <label htmlFor="vname">Vehicle Name:</label>
                                                <input type="text" className="form-control" name="vName" id="vName" defaultValue={cusData.vName} onChange={handleInputChange} disabled={!isEditing} />
                                            </div>

                                            <div className="col mt-3">
                                                <label htmlFor="vregno">Registration Number:</label>
                                                <input type="text" className="form-control" name="Regno" id="Regno" defaultValue={cusData.Regno} onChange={handleInputChange} disabled={!isEditing} />
                                            </div>

                                            <div className="col mt-3">
                                                <label htmlFor="vmodel">Color:</label>
                                                <input type="text" className="form-control" name="vColor" id="vColor" defaultValue={cusData.vColor} onChange={handleInputChange} disabled={!isEditing} />
                                            </div>

                                            <div className="col mt-3">
                                                <label htmlFor="vftype">Fuel Type:</label>
                                                <input type="text" className="form-control" name="vFuel" id="vFuel" defaultValue={cusData.vFuel} onChange={handleInputChange} disabled={!isEditing} />
                                            </div>
                                        </div>
                                        <div class="tab-pane fade" id="v-pills-sDetails" role="tabpanel" aria-labelledby="v-pills-sDetails-tab" tabindex="0">
                                            
                                            <div className="container">
                                                <div className="card">
                                                    <h2 className="title">Vehicle service details</h2>
                                                    <ul className="service-list">
                                                        <li className="service-item">Oil change - 10/02/2024</li>
                                                        <li className="service-item">Tire rotation - 12/15/2023</li>
                                                        <li className="service-item">Brake inspection - 08/20/2023</li>
                                                    </ul>
                                                </div>
                                            </div>

                                        </div>
                                        <div className="tab-pane fade" id="v-pills-notification" role="tabpanel" aria-labelledby="v-pills-notification-tab" tabindex="0">
                                            Notification
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-right mt-3">
                    {isEditing ? (
                        <button className="save-btn" onClick={handleSave}>Save</button>
                    ) : (
                        <button className="edit-btn" onClick={handleEdit}>Edit Profile</button>
                    )}
                </div>
            </div>



        </div>




    )
}

export default Userprofile