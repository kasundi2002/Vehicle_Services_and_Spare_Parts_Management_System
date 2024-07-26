import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

const Allcustomers = () => {
    const navigate = useNavigate();
    const componentPDF = useRef();

    //const history = useHistory();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {

        const fetchCustomers = async () => {
            try {
                const response = await axios.get("https://vehicle-sever.onrender.com/customers");
                setCustomers(response.data);
            } catch (error) {
                console.error("Error fetching customers:", error);
            }
        };
        fetchCustomers();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
        if (confirmDelete) {
            try {
                await axios.delete(`https://vehicle-sever.onrender.com/customers/${id}`);

                window.alert("Customer deleted successfully");
            } catch (error) {
                console.error("Error deleting customer:", error);
                window.alert("Failed to delete customer");
            }
        }
    };

    const handleClick = (id) => {
        console.log("Button clicked with ID:", id);
        navigate(`/customer/updatecustomer/${id}`);
    };
    const handleClicks = (id) => {
        console.log("Button clicked with ID:", id);
        navigate(`/customer/viewdetails/${id}`);
    };

    const generatePDF = useReactToPrint({
        content: () => componentPDF.current,
        documentTitle: "Userdata",
        onAfterPrint: () => alert("Data saved in PDF")
    });

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    return (


        <div className="mt-5">
            <div className="container">
                <h3>All customers</h3>
                <div className="container-fluid">
                    <form className="d-flex" role="search">
                        <input
                            className="form-control me-2"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </form>
                </div>
                <hr />
                <div className="con1">
                    <div className="addCust mt-2 mb-2 ">
                        <Link to="/customer/register" className="btn btn-primary">Add New Customer</Link>
                    </div>
                </div>

                <div ref={componentPDF} style={{ width: '100%' }}>

                    <table className="table">
                        <thead>
                            <tr class="table-dark">

                                <th scope="col">Name</th>
                                <th scope="col">NIC</th>
                                <th scope="col">Address</th>
                                <th scope="col">E-Mail</th>
                                <th scope="col">Contact No</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                        {customers.filter(customer =>
                        customer.name.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((customers, index) =>
                                <tr key={index}>
                                    <th>{customers.name}</th>
                                    <td>{customers.NIC}</td>
                                    <td>{customers.address}</td>
                                    <td>{customers.email}</td>
                                    <td>{customers.contactno}</td>
                                    <td className="d-flex justify-content-around">
                                        <button className="btn btn-success" onClick={() => handleClicks(customers._id)}><i class="fas fa-eye"></i></button>

                                        <button className="btn btn-primary" onClick={() => handleClick(customers._id)}><i class="fas fa-edit"></i></button>

                                        <button className="btn btn-danger" onClick={() => handleDelete(customers._id)}><i className="fas fa-trash"></i></button>


                                    </td>
                                </tr>)}

                        </tbody>
                    </table>
                </div>
                <div className="d-grid d-md-flex justify-content-md-end mb-3">
                    <button className="btn btn-success" onClick={generatePDF}>Generate Report</button>
                </div>


            </div>

        </div>
    )
}
export default (Allcustomers)