import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import INavBar from './InventoryNavBar/INavBar';  


export default function InsertInventory() {  
    const [inventoryName, setInventoryName] = useState("");
    const [inventoryType, setInventoryType] = useState("");
    const [vendor, setVendor] = useState("");
    const [unitPrice, setUnitPrice] = useState("");
    const [unitNo, setUnitNo] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const setName = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z\s]*$/.test(value) || value === "") {
            setInventoryName(value);
            setError("");
        } else {
            setError("* Only alphabets are allowed for Name");
        }
    }

    const setType = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z\s]*$/.test(value) || value === "") {
            setInventoryType(value);
            setError("");
        } else {
            setError("* Only alphabets are allowed for Item Type");
        }
    }

    const setVendorName = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z\s]*$/.test(value) || value === "") {
            setVendor(value);
            setError("");
        } else {
            setError("* Only alphabets are allowed for Vendor");
        }
    }

    const setPrice = (e) => {
        setUnitPrice(e.target.value);
    }

    const setUnit = (e) => {
        setUnitNo(e.target.value);
    }

    const setDescriptionValue = (e) => {
        setDescription(e.target.value);
    };

    const addInventory = async (e) => { 
        e.preventDefault();

        // Validation
        if (!inventoryName || !inventoryType || !vendor || !unitPrice || !description || !unitNo) {
            setError("*Please fill in all the required fields");
            return;
        }

        try {
            const res = await fetch("https://vehicle-sever.onrender.com/insertinventory", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "InventoryName": inventoryName, "InventoryType": inventoryType, "Vendor": vendor, "UnitPrice": unitPrice, "Description": description, "UnitNo": unitNo })
            });

            await res.json();

            if (res.status === 201) {
                alert("Product Added Successfully !");
                setInventoryName("");
                setInventoryType("");
                setVendor("");
                setUnitPrice("");
                setUnitNo("");
                setDescription("");
                navigate('/inventory');
            }
            else if (res.status === 422) {
                alert("Already a Product is added with the same product ID.");
            }
            else {
                setError("Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again later.");
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
        <INavBar />
        <div className='container-fluid p-5'>
            <div className="row justify-content-start align-items-start">
                <div className="col-lg-6 col-md-6 col-12">
                    <h1 className='text-center mb-5 d-none d-md-block'>Enter Product Information</h1>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="row">
                        <div className="col-12 mt-3">
                            <label htmlFor="inventory_name" className="form-label fw-bold">Inventory Name</label>
                            <input type="text" onChange={setName} value={inventoryName} className="form-control" id="inventory_name" placeholder="Enter Inventory Name" required />
                        </div>
                        <div className="col-12 mt-3">
                            <label htmlFor="inventory_type" className="form-label fw-bold">Inventory Type</label>
                            <input type="text" onChange={setType} value={inventoryType} className="form-control" id="inventory_type" placeholder="Enter Inventory Type" required />
                        </div>
                        <div className="col-12 mt-3">
                            <label htmlFor="vendor" className="form-label fw-bold">Vendor</label>
                            <input type="text" onChange={setVendorName} value={vendor} className="form-control" id="vendor" placeholder="Enter Vendor" required />
                        </div>
                        <div className="col-12 mt-3">
                            <label htmlFor="unit_price" className="form-label fw-bold">Unit Price</label>
                            <input type="number" onChange={setPrice} value={unitPrice} className="form-control" id="unit_price" placeholder="Enter Unit Price" required />
                        </div>
                        <div className="col-12 mt-3">
                            <label htmlFor="unit_no" className="form-label fw-bold">Number of Units</label>
                            <input type="number" onChange={setUnit} value={unitNo} className="form-control" id="unit_no" placeholder="Enter Number of Units" required />
                        </div>
                        <div className="col-12 mt-3">
                            <label htmlFor="description" className="form-label fw-bold">Description</label>
                            <textarea onChange={setDescriptionValue} value={description} className="form-control" id="description" placeholder="Enter Description" required />
                        </div>
                    </div>
                    <div className='d-flex justify-content-end mt-3'>
                        <NavLink to="/inventory" className='btn btn-secondary me-3'>Cancel</NavLink>
                        <button type="submit" onClick={addInventory} className="btn btn-primary" disabled={loading}>{loading ? 'Inserting...' : 'Insert'}</button>
                    </div>
                </div>
                <div className="col-lg-6 col-md-6 col-12">
                    <img className="img-fluid w-100" src="/src/assets/inventory_img.png" alt="productimage" style={{ margin: 0 }} />
                </div>
            </div>
        </div>
        </>
        
    );
}
