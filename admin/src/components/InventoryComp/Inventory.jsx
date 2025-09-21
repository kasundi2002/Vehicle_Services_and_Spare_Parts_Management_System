import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Product.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import INavBar from './InventoryNavBar/INavBar';

export default function Inventory() {
    const [inventoryData, setInventoryData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteAlert, setDeleteAlert] = useState(false);
    const [deletedInventoryId, setDeletedInventoryId] = useState('');
    const [lowInventoryAlert, setLowInventoryAlert] = useState(false);
    const [emailStatus, setEmailStatus] = useState(null);

    useEffect(() => {
        getInventory();
    }, []);

    useEffect(() => {
        if (deleteAlert) {
            const timer = setTimeout(() => {
                setDeleteAlert(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [deleteAlert]);

    const getInventory = async () => {
        try {
            const res = await fetch("https://vehicle-sever.onrender.com/inventory", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                console.log("Data Retrieved.");
                const data = await res.json();
                setInventoryData(data);
                // Calculate total units
                const totalUnits = data.reduce((total, inventory) => total + inventory.UnitNo, 0);
                // Check if total units are less than 10
                setLowInventoryAlert(totalUnits < 10);
            } else {
                console.log("Something went wrong. Please try again.");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const deleteInventory = async (id) => {
        try {
            const response = await fetch(`https://vehicle-sever.onrender.com/deleteinventory/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                console.log("Inventory deleted");
                setDeletedInventoryId(id);
                setDeleteAlert(true);
                getInventory();
            } else {
                console.log("Error deleting inventory");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleGenerateReport = () => {
        const input = document.getElementById('report-table');
        const tableHeader = input.querySelector('thead');
        const container = document.createElement('div');
        container.style.marginTop = '20px';
        container.style.marginLeft = '30px';
        container.style.marginRight = '20px';
        container.style.marginBottom = '20px';
        container.style.textAlign = 'center';
        container.style.border = '1px solid #ccc'; // Add border
    
        // Add company logo and title
        const companyLogo = document.createElement('img');
        companyLogo.src = 'path/to/your/logo.png'; // Replace with your logo path
        companyLogo.style.width = '200px'; // Adjust logo size
        container.appendChild(companyLogo);
    
        const companyName = document.createElement('div');
        companyName.textContent = 'P&D Auto Engineers';
        companyName.style.fontSize = '24px';
        companyName.style.marginBottom = '20px';
        container.appendChild(companyName);
    
        // Add table title
        const tableTitle = document.createElement('div');
        tableTitle.textContent = 'Inventory Report';
        tableTitle.style.fontSize = '24px';
        tableTitle.style.marginBottom = '20px';
    
        container.appendChild(tableTitle);
        const tableClone = input.cloneNode(true);
        const tableRows = tableClone.getElementsByTagName('tr');
        for (let i = 0; i < tableRows.length; i++) {
            const lastCellIndex = tableRows[i].cells.length - 1;
            tableRows[i].deleteCell(lastCellIndex);
        }
        container.appendChild(tableClone);
        document.body.appendChild(container);
    
        html2canvas(container).then((canvas) => {
            const imgData = canvas.toDataURL('/src/assets/logo.png');
            const pdf = new jsPDF('p', 'pt', 'letter');
            const imgWidth = 595.28;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save("inventory_report.pdf");
            document.body.removeChild(container);
        });
    };
    

    const downloadInvoice = (id) => {
        const inventory = inventoryData.find(item => item.InventoryID === id);
        if (inventory) {
            const pdf = new jsPDF();
            const contentWidth = 100;
            const contentHeight = 140;
            const startX = (pdf.internal.pageSize.getWidth() - contentWidth) / 2;
            const startY = (pdf.internal.pageSize.getHeight() - contentHeight) / 2;
    
            pdf.setFontSize(20);
            pdf.setTextColor(44, 62, 80); 
            pdf.text(105, startY, `Invoice`, { align: 'center' });
    
            pdf.setFontSize(12);
            pdf.setTextColor(44, 62, 80); 
            pdf.text(startX, startY + 20, `Inventory ID: ${inventory.InventoryID}`);
            pdf.text(startX, startY + 30, `Inventory Type: ${inventory.InventoryType}`);
            pdf.text(startX, startY + 40, `Inventory Name: ${inventory.InventoryName}`);
            pdf.text(startX, startY + 50, `Vendor: ${inventory.Vendor}`);
            pdf.text(startX, startY + 60, `Unit Price: ${inventory.UnitPrice}`);
            pdf.text(startX, startY + 70, `Number of Units: ${inventory.UnitNo}`);
            pdf.text(startX, startY + 80, `Description: ${inventory.Description}`);
    
            pdf.setLineWidth(0.5);
            pdf.setDrawColor(44, 62, 80);
            pdf.rect(startX - 5, startY - 5, contentWidth + 10, contentHeight + 10);
    
            pdf.save(`invoice_${id}.pdf`);
        }
    };
    
    const filteredInventory = inventoryData.filter(inventory => {
        if (inventory.InventoryID) {
            return inventory.InventoryID.toString().toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
    });

    // Calculate total units
    const totalUnits = filteredInventory.reduce((total, inventory) => total + inventory.UnitNo, 0);

    // Function to handle sending email
    const handleSendEmail = async () => {
        try {
            const response = await fetch("https://vehicle-sever.onrender.com/sendmail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ to: "pavithrameddaduwage@gmail.com", subject: "Low Inventory Alert", text: "Inventory levels are low. Please replenish stock." })
            });

            if (response.ok) {
                setEmailStatus("Email sent successfully!!");
            } else {
                setEmailStatus("Failed to send email. Please try again later.");
            }
        } catch (error) {
            setEmailStatus("Error sending email. Please try again later.");
        }
    };

    return (
        <>
            <INavBar />
            <div className='container-fluid p-5'>
                <h1 className="mb-4">All Inventory</h1>
                <div className="mb-3">
                    <input type="text" className="form-control" placeholder="Search by Inventory ID" onChange={handleSearch} />
                </div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <NavLink to="/insertinventory" className='btn btn-primary fs-5 text-white'>
                        <i className="fa-solid fa-plus me-2"></i>Add New Inventory
                    </NavLink>
                    <button className="btn btn-success fs-5" onClick={handleGenerateReport}>
                        <i className="fa-solid fa-file me-2"></i>Generate Report
                    </button>
                    <button className="btn btn-warning fs-5" onClick={handleSendEmail}>
                        <i className="fa-solid fa-envelope me-2"></i>Send Email
                    </button>
                </div>
                <div className="overflow-auto" style={{ maxHeight: "600px" }}>
                    <table id="report-table" className="custom-table">
                        <thead>
                            <tr>
                                <th scope="col">Inventory ID</th>
                                <th scope="col">Inventory Type</th>
                                <th scope="col">Inventory Name</th>
                                <th scope="col">Vendor</th>
                                <th scope="col">Unit Price</th>
                                <th scope="col">Number of Units</th>
                                <th scope="col">Description</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.map((inventory, index) => (
                                <tr key={index}>
                                    <td onClick={() => downloadInvoice(inventory.InventoryID)}>{inventory.InventoryID}</td>
                                    <td>{inventory.InventoryType}</td>
                                    <td>{inventory.InventoryName}</td>
                                    <td>{inventory.Vendor}</td>
                                    <td>{inventory.UnitPrice}</td>
                                    <td>{inventory.UnitNo}</td>
                                    <td>{inventory.Description}</td>
                                    <td className="text-center">
                                        <NavLink to={`/updateinventory/${inventory._id}`} className="btn btn-warning me-1">
                                            <i className="fa-solid fa-pen-to-square"></i> Update
                                        </NavLink>
                                        <button className="btn btn-danger" onClick={() => deleteInventory(inventory._id)}>
                                            <i className="fa-solid fa-trash"></i> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4">
                    <p>Total Units: {totalUnits}</p>
                    {lowInventoryAlert && (
                        <div className="alert alert-warning mt-2" role="alert">
                            Inventory units are low!
                        </div>
                    )}
                    {emailStatus && (
                        <div className={`alert ${emailStatus.includes("successfully") ? "alert-success" : "alert-danger"} mt-2`} role="alert">
                            {emailStatus}
                        </div>
                    )}
                </div>
                {deleteAlert && (
                    <div className="alert alert-success alert-dismissible fade show mt-4" role="alert">
                        Inventory deleted successfully!
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setDeleteAlert(false)}></button>
                    </div>
                )}
            </div>
        </>
    );
}
