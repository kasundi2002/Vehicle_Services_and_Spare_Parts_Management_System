import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import './Product.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import INavBar from './InventoryNavBar/INavBar';

export default function UpdateInventory() {
    const [inventoryName, setInventoryName] = useState("");
    const [inventoryType, setInventoryType] = useState("");
    const [vendor, setVendor] = useState("");
    const [unitPrice, setUnitPrice] = useState("");
    const [unitNo, setUnitNo] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        getInventory();
    }, [id]);

    const getInventory = async () => {
        try {
            const res = await fetch(`https://vehicle-sever.onrender.com/inventory/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                console.log("Data Retrieved.");
                const data = await res.json();
                setInventoryName(data.InventoryName);
                setInventoryType(data.InventoryType);
                setVendor(data.Vendor);
                setUnitPrice(data.UnitPrice);
                setUnitNo(data.UnitNo);
                setDescription(data.Description);
            } else {
                console.log("Something went wrong. Please try again.");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const updateInventory = async (e) => {
        e.preventDefault();

        // Validation
        if (!inventoryName || !inventoryType || !vendor || !unitPrice || !description || !unitNo) {
            setError("*Please fill in all the required fields.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`https://vehicle-sever.onrender.com/updateinventory/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "InventoryName": inventoryName, "InventoryType": inventoryType, "Vendor": vendor, "UnitPrice": unitPrice, "Description": description,"UnitNo":unitNo})
            });

            if (response.ok) {
                alert("Inventory Details Updated Successfully");
                navigate('/inventory');
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
         
        <div className='container-fluid p-0' style={{ marginTop: '50px' }}>
            <div className='container d-flex justify-content-center align-items-center' style={{ minHeight: '100vh' }}>
                <div className='update-form'>
                    <h3 className='text-center'>Update Inventory Information</h3>
                    <div className="row mt-3">
                        <div className="col-lg-6 col-md-6 col-12">
                            <label htmlFor="inventory_name" className="form-label fs-4 fw-bold">Inventory Name</label>
                            <input type="text" onChange={(e) => setInventoryName(e.target.value)} value={inventoryName} className="custom-input" id="inventory_name" placeholder="Enter Inventory Name" required />
                        </div>
                        <div className="col-lg-6 col-md-6 col-12">
                            <label htmlFor="inventory_type" className="form-label fs-4 fw-bold">Inventory Type</label>
                            <input type="text" onChange={(e) => setInventoryType(e.target.value)} value={inventoryType} className="custom-input" id="inventory_type" placeholder="Enter Inventory Type" required />
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
                        <div className="col-lg-6 col-md-6 col-12">
                            <label htmlFor="unit_no" className="form-label fs-4 fw-bold">Number of Units</label>
                            <input type="number" onChange={(e) => setUnitNo(e.target.value)} value={unitNo} className="custom-input" id="unit_no" placeholder="Enter " requiredNo of Units />
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col-lg-12">
                            <label htmlFor="description" className="form-label fs-4 fw-bold">Description</label>
                            <textarea onChange={(e) => setDescription(e.target.value)} value={description} className="custom-textarea" id="description" placeholder="Enter Description" required />
                        </div>
                    </div>
                    <div className='d-flex justify-content-center mt-5'>
                        <NavLink to="/inventory" className='btn btn-secondary me-3 fs-4'>Cancel</NavLink>
                        <button type="submit" onClick={updateInventory} className="btn btn-primary fs-4" disabled={loading}>{loading ? 'Updating...' : 'Update'}</button>
                    </div>
                    <div className="col text-center mt-3">
                        {error && <div className="text-danger mt-3 fs-5 fw-bold">{error}</div>}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

