import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
 
export default function InsertProduct() {
    const [itemName, setItemName] = useState("");
    const [itemType, setItemType] = useState("");
    const [vendor, setVendor] = useState("");
    const [unitPrice, setUnitPrice] = useState("");
    const [description, setDescription] = useState("");
    const [itemID, setItemID] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const setName = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z\s]*$/.test(value) || value === "") {
            setItemName(value);
            setError("");
        } else {
            setError("* Only alphabets are allowed for Name");
        }
    }

    const setType = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z\s]*$/.test(value) || value === "") {
            setItemType(value);
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

    const setDescriptionValue = (e) => {
        setDescription(e.target.value);
    };

    const setItemIDValue = (e) => {
        setItemID(e.target.value);
    };

    const addProduct = async (e) => {
        e.preventDefault();

        // Validation
        if (!itemName || !itemType || !vendor || !unitPrice || !description || !itemID) {
            setError("*Please fill in all the required fields");
            return;
        }

        // Validate itemID 
        if (!/^d\d{1,4}$/i.test(itemID)) {
            setError("*Item ID must start with 'd' followed by three digits (e.g., d123)");
            return;
        }

        // Validate unitPrice
        if (isNaN(unitPrice)) {
            setError("*Unit Price must be a number");
            return;
        }

        try {
            const res = await fetch("http://localhost:3001/insertproduct", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "ItemID": itemID, "ItemName": itemName, "ItemType": itemType, "Vendor": vendor, "UnitPrice": unitPrice, "Description": description })
            });

            await res.json();

            if (res.status === 201) {
                alert("Product Added Successfully !");
                setItemID("");
                setItemName("");
                setItemType("");
                setVendor("");
                setUnitPrice("");
                setDescription("");
                navigate('/products');
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
        <div className='container-fluid p-5'>
            <h1 className='text-center mb-5 d-md-none'>Enter Product Information</h1>
            <div className="row justify-content-start align-items-start">
                <div className="col-lg-6 col-md-6 col-12">
                    <h1 className='text-center mb-5 d-none d-md-block'>Enter Product Information</h1>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="row">
                        <div className="col-12">
                            <label htmlFor="item_id" className="form-label fw-bold">Item ID</label>
                            <input type="text" onChange={setItemIDValue} value={itemID} className="form-control" id="item_id" placeholder="Enter Item ID" required />
                        </div>
                        <div className="col-12 mt-3">
                            <label htmlFor="item_name" className="form-label fw-bold">Item Name</label>
                            <input type="text" onChange={setName} value={itemName} className="form-control" id="item_name" placeholder="Enter Item Name" required />
                        </div>
                        <div className="col-12 mt-3">
                            <label htmlFor="item_type" className="form-label fw-bold">Item Type</label>
                            <input type="text" onChange={setType} value={itemType} className="form-control" id="item_type" placeholder="Enter Item Type" required />
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
                            <label htmlFor="description" className="form-label fw-bold">Description</label>
                            <textarea onChange={setDescriptionValue} value={description} className="form-control" id="description" placeholder="Enter Description" required />
                        </div>
                    </div>
                    <div className='d-flex justify-content-end mt-3'>
                        <NavLink to="/products" className='btn btn-secondary me-3'>Cancel</NavLink>
                        <button type="submit" onClick={addProduct} className="btn btn-primary" disabled={loading}>{loading ? 'Inserting...' : 'Insert'}</button>
                    </div>
                </div>
                <div className="col-lg-6 col-md-6 col-12">
                    <img className="img-fluid w-100" src="images/img1.jpg" alt="productimage" style={{ margin: 0 }} />
                </div>
            </div>
        </div>
    )
}
