import React, { useState, useEffect } from 'react';
import Navbar from '../../Navbar/Navbar';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UpdateIcon from '@mui/icons-material/Update';
import DownloadIcon from '@mui/icons-material/Download';
import Category from '../OrderCategory/OrderCategory';
import Search from '../OrderSearch/OrderSearch';
import './OrderList.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logoBase64 from './newlogo.png';

function OrderList() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [updatePopupOpen, setUpdatePopupOpen] = useState(false); 
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [selectedCategory, searchTerm]);

    useEffect(() => {
        filterOrders();
    }, [orders, selectedCategory, searchTerm]);

    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:4000/orders');
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const filterOrders = () => {
        let filtered = orders;
        if (selectedCategory !== '') {
            filtered = filtered.filter(order => order.status === selectedCategory);
        }
        if (searchTerm !== '') {
            const query = searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                order.fullName.toLowerCase().includes(query) ||
                order.contact.toLowerCase().includes(query) ||
                order.email.toLowerCase().includes(query)
            );
        }
        setFilteredOrders(filtered);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
    };

    const handleSearch = (searchTerm) => {
        setSearchTerm(searchTerm);
    };

    const handleUpdateClick = (orderId) => {
        setSelectedOrderId(orderId);
        setUpdatePopupOpen(true);
    };    

    const handleDeleteOrder = async (orderId) => {
        try {
            const response = await fetch(`http://localhost:4000/order/${orderId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete order');
            }
            const updatedOrders = filteredOrders.filter(order => order.orderId !== orderId);
            setFilteredOrders(updatedOrders);
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const handleStatusChange = (event) => {
        setNewStatus(event.target.value);
    };

    const handleUpdateStatus = async () => {
        try {
            const response = await fetch(`http://localhost:4000/order/${selectedOrderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) {
                throw new Error('Failed to update order status');
            }
            const updatedOrders = filteredOrders.map(order => {
                if (order.orderId === selectedOrderId) {
                    return { ...order, status: newStatus };
                }
                return order;
            });
            setFilteredOrders(updatedOrders);
            setUpdatePopupOpen(false);
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleDownloadOrderReport = () => {
        const pdf = new jsPDF();
    
        pdf.autoTable({
            head: [['Order ID', 'Full Name', 'Email', 'Address', 'Contact', 'Payment Method', 'Total Amount', 'Order Date', 'Status', 'Items']],
            body: filteredOrders.map(order => [
                order.orderId,
                order.fullName,
                order.email,
                order.address,
                order.contact,
                order.paymentMethod,
                order.totalAmount,
                new Date(order.orderDate).toLocaleDateString(),
                order.status,
                order.items.map(item => `${item.productId} - Quantity: ${item.quantity}`).join('\n')
            ]),
            styles: {
                font: 'helvetica',
                fontSize: 6,
                cellPadding: 2,
                valign: 'middle',
                halign: 'center'
            },
            margin: { top: 25, left: 5, right: 5 },
            didDrawPage: function(data) {
                // Header
                pdf.setFontSize(10);
                pdf.setTextColor(40);
                const headerText = 'Order Report';
                const padding = 5;
                const textWidth = pdf.getStringUnitWidth(headerText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
                const textOffset = (pdf.internal.pageSize.width - textWidth) / 2;
                const headerHeight = 10;
                const bottomMargin = 10;
                pdf.text(headerText, textOffset + padding, headerHeight + bottomMargin);
                // Footer
                const pageCount = pdf.internal.getNumberOfPages();
                pdf.setFontSize(6);
                pdf.text('Page ' + pageCount, data.settings.margin.left, pdf.internal.pageSize.height - 10);
            }            
            
        });
    
        pdf.save('order_report.pdf');
    };

    const handleDownloadOrderDetails = (order) => {
        const pdf = new jsPDF();
    
        const width = 50;
        const height = 50;
        pdf.addImage(logoBase64, 'PNG', 160, 35, width, height);
    
        pdf.setFontSize(16);
        pdf.text('Delivery Details', 10, 10);
        pdf.setFontSize(12);
        pdf.text('Full Name:', 10, 20);
        pdf.text(order.fullName, 40, 20);
        pdf.text('Address:', 10, 30);
        pdf.text(order.address, 40, 30);
        pdf.text('Contact:', 10, 40);
        pdf.text(String(order.contact), 40, 40);
        pdf.text('Email:', 10, 50);
        pdf.text(order.email, 40, 50);
        pdf.text('Total Amount:', 10, 60);
        pdf.text(String(order.totalAmount), 40, 60);
        pdf.setFontSize(16);
        pdf.text('Thank you for shopping with us', 10, 70);
    
        pdf.save(`${order.fullName}_details.pdf`);
    };
    
    

    return (
        <div>
            <Navbar />
            {updatePopupOpen && <div className="overlay"></div>}
            <div className="order-filter">
                <Category onCategoryChange={handleCategoryChange} />
                <Search onSearch={handleSearch} />
                <button className='gReport' onClick={handleDownloadOrderReport}>Generate Report</button>
            </div>
            <div className="orders-table-container">
                {updatePopupOpen && (
                    <div className="update-popup">
                        <h3>Update Order Status</h3>
                        <select className='statInput' value={newStatus} onChange={handleStatusChange}>
                            <option value="Processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                        </select>
                        <button className='ordersup' onClick={handleUpdateStatus}>Update</button>
                        <button className='orderscancel' onClick={() => setUpdatePopupOpen(false)}>Cancel</button>
                    </div>
                )}
                <table id="orders-table" className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Address</th>
                            <th>Contact</th>
                            <th>Payment Method</th>
                            <th>Total Amount</th>
                            <th>Order Date</th>
                            <th>Status</th>
                            <th>Items</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.orderId} className="order-row">
                                <td>{order.orderId}</td>
                                <td>{order.fullName}</td>
                                <td>{order.email}</td>
                                <td>{order.address}</td>
                                <td>{order.contact}</td>
                                <td>{order.paymentMethod}</td>
                                <td>{order.totalAmount}</td>
                                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                <td>{order.status}</td>
                                <td>
                                    <ul className="item-list">
                                        {order.items.map((item, index) => (
                                            <li key={index} className="item">{item.productId} - Quantity: {item.quantity}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="action-column">
                                    <UpdateIcon className="update-icon" onClick={() => handleUpdateClick(order.orderId)} />
                                    <DeleteOutlineIcon className="delete-icon" onClick={() => handleDeleteOrder(order.orderId)} />
                                    <DownloadIcon className='download-lable' onClick={() => handleDownloadOrderDetails(order)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default OrderList;
