import React, { useState } from "react";
import "./Register.css";
import axios from "axios";

const Register = () => {

    const [customerData, setCustomerData] = useState({
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomerData({
            ...customerData,
            [name]: value,
        });
        console.log(customerData)
    };

    const handlesubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("https://vehicle-sever.onrender.com/customers", customerData).then(() => {
                setCustomerData({
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
                })

            })
            alert('Customer created successfully');

        }
        catch (error) {
            console.error('Error creating customer:', error);
            alert('Failed to create customer. Please try again.');
        }

    }


    return (

        <div className="container1 mt-5">
            <h1 className="cReg">Customer Registration</h1>
            <form onSubmit={handlesubmit}>
                <div className="row mt-5">
                    <div className="col mt-3">

                        <label htmlFor="detais mt-3"><h4>Customer Details</h4></label>
                        <div className="col mt-3">
                            <label htmlFor="cname">Full Name:</label>
                            <input type="text" className="form-control" name="name" id="name" value={customerData.name} onChange={handleChange} />
                        </div>

                        <div className="col mt-3">
                            <label htmlFor="cnic">NIC:</label>
                            <input type="text" className="form-control" name="NIC" id="NIC" value={customerData.NIC} onChange={handleChange} />
                        </div>

                        <div className="col mt-3">
                            <label htmlFor="caddress">Address:</label>
                            <input type="text" className="form-control" name="address" id="address" value={customerData.address} onChange={handleChange} />
                        </div>

                        <div className="col mt-3">
                            <label htmlFor="cemail">Email Address:</label>
                            <input type="email" className="form-control" name="email" id="email" value={customerData.email} onChange={handleChange} />
                        </div>

                        <div className="col mt-3">
                            <label htmlFor="cno">Contact Number:</label>
                            <input type="number" className="form-control" name="contactno" id="contactno" value={customerData.contactno} onChange={handleChange} />
                        </div>


                    </div>

                    <div className="col mt-3">
                        <label htmlFor="details mt-2"><h4>Vehicle Details</h4></label>
                        <div className="col mt-3">
                            <label htmlFor="vtype">Vehicle Type:</label>
                            <input type="text" className="form-control" name="vType" id="vType" value={customerData.vType} onChange={handleChange} />
                        </div>

                        <div className="col mt-3">
                            <label htmlFor="vname">Vehicle Name:</label>
                            <input type="text" className="form-control" name="vName" id="vName" value={customerData.vName} onChange={handleChange} />
                        </div>

                        <div className="col mt-3">
                            <label htmlFor="vregno">Registration Number:</label>
                            <input type="text" className="form-control" name="Regno" id="Regno" value={customerData.Regno} onChange={handleChange} />
                        </div>

                        <div className="col mt-3">
                            <label htmlFor="vmodel">Color:</label>
                            <input type="text" className="form-control" name="vColor" id="vColor" value={customerData.vColor} onChange={handleChange} />
                        </div>

                        <div className="col mt-3">
                            <label htmlFor="vftype">Fuel Type:</label>
                            <input type="text" className="form-control" name="vFuel" id="vFuel" value={customerData.vFuel} onChange={handleChange} />
                        </div>

                    </div>

                </div>

                <button type="submit" className="submit-btn">Submit</button>
            </form>
        </div>


    )
}
export default Register