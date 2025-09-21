import React from "react";
import "./Edituser.css";
import Navbar from "./Navbar";

const Edituser = () => {
    return (

        <div className="container light-style flex-grow-1 container-p-y">
            <h4 className="font-weight-bold py-3 mb-4">
                My Profile
            </h4>
            <div className="card overflow-hidden">
                <div className="row no-gutters row-bordered row-border-light">
                    <div className="col-md-3 pt-0">
                        <h1>User Profile</h1>
                        <div className="card-body media align-items-center">
                            <img src="https://bootdey.com/img/Content/avatar/avatar1.png"
                                className="d-block ui-w-80 rounded-circle" />
                        </div>
                        <div class="nav flex-column nav-pills me-3" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                            <button class="nav-link active" id="v-pills-home-tab" data-bs-toggle="pill" data-bs-target="#v-pills-home" type="button" role="tab" aria-controls="v-pills-home" aria-selected="true">Home</button>
                            <button class="nav-link" id="v-pills-profile-tab" data-bs-toggle="pill" data-bs-target="#v-pills-profile" type="button" role="tab" aria-controls="v-pills-profile" aria-selected="false">Profile</button>
                            <button class="nav-link" id="v-pills-disabled-tab" data-bs-toggle="pill" data-bs-target="#v-pills-disabled" type="button" role="tab" aria-controls="v-pills-disabled" aria-selected="false" disabled>Disabled</button>
                            <button class="nav-link" id="v-pills-messages-tab" data-bs-toggle="pill" data-bs-target="#v-pills-messages" type="button" role="tab" aria-controls="v-pills-messages" aria-selected="false">Messages</button>
                            <button class="nav-link" id="v-pills-settings-tab" data-bs-toggle="pill" data-bs-target="#v-pills-settings" type="button" role="tab" aria-controls="v-pills-settings" aria-selected="false">Settings</button>
                        </div>
                    </div>
                    <div className="col-md-9">
                        <div className="tab-content">
                            <div className="tab-pane fade active show" id="account-general">
                                <hr className="border-light m-0" />
                                <div class="tab-content" id="v-pills-tabContent">
                                    <div class="tab-pane fade show active" id="v-pills-home" role="tabpanel" aria-labelledby="v-pills-home-tab" tabindex="0">
                                        <div className="col mt-3">
                                            <label htmlFor="cname">Full Name:</label>
                                            <input type="text" class="form-control" id="cname" />
                                        </div>
                                        <div className="col mt-3">
                                            <label htmlFor="cnic">NIC:</label>
                                            <input type="text" class="form-control" id="cnic" />
                                        </div>
                                        <div className="col mt-3">
                                            <label htmlFor="caddress">Address:</label>
                                            <input type="text" class="form-control" id="caddress" />
                                        </div>

                                        <div className="col mt-3">
                                            <label htmlFor="cemail">Email Address:</label>
                                            <input type="email" class="form-control" id="cemail" />
                                        </div>

                                        <div class="col mt-3">
                                            <label htmlFor="cno">Contact Number:</label>
                                            <input type="number" class="form-control" id="cno" />
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="v-pills-profile" role="tabpanel" aria-labelledby="v-pills-profile-tab" tabindex="0">
                                        <div className="col mt-3">
                                            <label htmlFor="vtype">Vehicle Type:</label>
                                            <input type="text" class="form-control" id="vtype" />
                                        </div>

                                        <div class="col mt-3">
                                            <label htmlFor="vname">Vehicle Name:</label>
                                            <input type="text" class="form-control" id="vname" />
                                        </div>

                                        <div className="col mt-3">
                                            <label htmlFor="vregno">Registration Number:</label>
                                            <input type="text" class="form-control" id="vregno" />
                                        </div>

                                        <div className="col mt-3">
                                            <label htmlFor="vmodel">Model:</label>
                                            <input type="text" class="form-control" id="vmodel" />
                                        </div>

                                        <div className="col mt-3">
                                            <label htmlFor="vftype">Fuel Type:</label>
                                            <input type="text" class="form-control" id="vftype" />
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="v-pills-messages" role="tabpanel" aria-labelledby="v-pills-messages-tab" tabindex="0">
                                        Vehicle service details

                                    </div>
                                    <div class="tab-pane fade" id="v-pills-settings" role="tabpanel" aria-labelledby="v-pills-settings-tab" tabindex="0">
                                        Notification
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="text-right mt-3">
                <button type="button" class="btn btn-primary">Edit Profile</button>&nbsp;
                <button type="button" class="btn btn-danger">Cancel</button>
            </div>
        </div>






    )
}
export default Edituser