import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";


const ViewDetails = () => {
    const {id} = useParams()
    console.log("sd",id)

    const[cusData , setCusData] = useState({
        name :"",
        NIC : "",
        address : "",
        contactno : "",
        email : "",
        vType : "",
        vName: "",
        Regno : "",
        vColor : "",
        vFuel : "",
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        axios.get(`http://localhost:4000/customers/${id}`).then((res) => {
            setCusData(res.data);
            console.log(res.data);

            const{name, NIC, address,contactno,email,vType,vName,Regno,vColor,vFuel} = res.data;

            setCusData({
                ...cusData,
                name:name,
                NIC:NIC,
                address:address,
                contactno:contactno,
                email:email,
                vType:vType,
                vName:vName,
                Regno:Regno,
                vColor:vColor,
                vFuel:vFuel
            })

            console.log("cusData",cusData)
        }).catch(() => {
            console.log("Error while data")
        });
    }, []);

    const handleChange = event =>{
        const{name,value} = event.target;

        setCusData({
            ...cusData,
            [name]:value,
        })
    }

    
    return (
        <div className="container1 mt-5">
            <h1 className="cReg">Details</h1>
            <div className="row mt-5">
                <div className="col mt-3">
                    <label htmlFor="detais mt-3"><h4>Customer Details</h4></label>
                    <div className="col mt-3">
                        <label htmlFor="cname">Full Name</label>
                        <input type="text" className="form-control" name="name" id="name" defaultValue={cusData.name}/>
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="cnic">NIC:</label>
                        <input type="text" className="form-control" name="NIC" id="NIC" value={cusData.NIC} />
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="caddress">Address:</label>
                        <input type="text" className="form-control" name="address" id="address" value={cusData.address} />
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="cemail">Email Address:</label>
                        <input type="email" className="form-control" name="email" id="email" value={cusData.email} />
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="cno">Contact Number:</label>
                        <input type="number" className="form-control" name="contactno" id="contactno" value={cusData.contactno} />
                    </div>

                </div>

                <div className="col mt-3">
                    <label htmlFor="details mt-2"><h4>Vehicle Details</h4></label>
                    <div className="col mt-3">
                        <label htmlFor="vtype">Vehicle Type:</label>
                        <input type="text" className="form-control" id="vtype" value={cusData.vType}/>
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="vname">Vehicle Name:</label>
                        <input type="text" className="form-control" id="vname" value={cusData.vName}/>
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="vregno">Registration Number:</label>
                        <input type="text" className="form-control" id="vregno" value={cusData.Regno}/>
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="vcolor">Color:</label>
                        <input type="text" className="form-control" id="vmodel" value={cusData.vColor}/>
                    </div>

                    <div className="col mt-3">
                        <label htmlFor="vftype">Fuel Type:</label>
                        <input type="text" className="form-control" id="vftype" value={cusData.vFuel}/>
                    </div>

                </div>

            </div>

        </div>
    )
}

export default ViewDetails