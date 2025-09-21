{/*import React, { useState, useEffect } from "react";
import axios from "axios";
import Allcustomer from "./Allcustomers";

const Viewcustomerlist = () => {

    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3010/api/customers").then((res) => {
            setCustomers(res.data);
            console.log(res.data);
        }).catch(() => {
            console.log("Error while data")
        });
    }, []);

    const Viewcustomerlist = customers.length === 0 ? "no customer found" : customers.map((customer, index) => (<Allcustomer key={index} customer={customer}/>)
    );

    return (
        <div className="ShowCustomerList">
            <div className="container">
                <div className="list">{Viewcustomerlist}</div>
            </div>
        </div>
    );
};

export default Viewcustomerlist*/}