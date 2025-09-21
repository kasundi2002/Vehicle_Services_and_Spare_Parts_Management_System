import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';


export default function UpdateProduct() {
    const [itemName, setItemName] = useState("");
    const [itemType, setItemType] = useState("");
    const [vendor, setVendor] = useState("");
    const [unitPrice, setUnitPrice] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        getProduct();
    }, [id]);

    const getProduct = async () => {
        try {
            const res = await fetch(`http://localhost:3001/products/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                console.log("Data Retrieved.");
                const data = await res.json();
                setItemName(data.ItemName);
                setItemType(data.ItemType);
                setVendor(data.Vendor);
                setUnitPrice(data.UnitPrice);
                setDescription(data.Description);
            } else {
                console.log("Something went wrong. Please try again.");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const updateProduct = async (e) => {
        e.preventDefault();

        // Validation
        if (!itemName || !itemType || !vendor || !unitPrice || !description) {
            setError("*Please fill in all the required fields.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`http://localhost:3001/updateproduct/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "ItemName": itemName, "ItemType": itemType, "Vendor": vendor, "UnitPrice": unitPrice, "Description": description })
            });

            if (response.ok) {
                alert("Product Details Updated Successfully");
                navigate('/products');
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
        <div className='container-fluid p-0'>
            <div className='container d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
                <div className='update-form'>
                    <h3 className='text-center'>Update Product Information</h3>
                    <div className="row mt-3">
                        <div className="col-lg-6 col-md-6 col-12">
                            <label htmlFor="item_name" className="form-label fs-4 fw-bold">Item Name</label>
                            <input type="text" onChange={(e) => setItemName(e.target.value)} value={itemName} className="custom-input" id="item_name" placeholder="Enter Item Name" required />
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                            <label htmlFor="item_type" className="form-label fs-4 fw-bold">Item Type</label>
                            <input type="text" onChange={(e) => setItemType(e.target.value)} value={itemType} className="custom-input" id="item_type" placeholder="Enter Item Type" required />
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-lg-6 col-md-6 col-12">
                            <label htmlFor="vendor" className="form-label fs-4 fw-bold">Vendor</label>
                            <input type="text" onChange={(e) => setVendor(e.target.value)} value={vendor} className="custom-input" id="vendor" placeholder="Enter Vendor" required />
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                            <label htmlFor="unit_price" className="form-label fs-4 fw-bold">Unit Price</label>
                            <input type="number" onChange={(e) => setUnitPrice(e.target.value)} value={unitPrice} className="custom-input" id="unit_price" placeholder="Enter Unit Price" required />
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-lg-12">
                            <label htmlFor="description" className="form-label fs-4 fw-bold">Description</label>
                            <textarea onChange={(e) => setDescription(e.target.value)} value={description} className="custom-textarea" id="description" placeholder="Enter Description" required />
                        </div>
                    </div>
                    <div className='d-flex justify-content-center mt-5'>
                        <NavLink to="/products" className='btn btn-secondary me-3 fs-4'>Cancel</NavLink>
                        <button type="submit" onClick={updateProduct} className="btn btn-primary fs-4" disabled={loading}>{loading ? 'Updating...' : 'Update'}</button>
                    </div>
                    <div className="col text-center mt-3">
                        {error && <div className="text-danger mt-3 fs-5 fw-bold">{error}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
