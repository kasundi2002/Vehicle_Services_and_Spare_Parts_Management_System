import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import './OnlineshopDb.css';

const OnlineshopDb = () => {
    const [processingCount, setProcessingCount] = useState(0);
    const [shippedCount, setShippedCount] = useState(0);
    const [deliveredCount, setDeliveredCount] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalDeliveredAmount, setTotalDeliveredAmount] = useState(0);
    const [totalPendingAmount, setTotalPendingAmount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const processingResponse = await axios.get('http://localhost:4000/processingOrders');
                if (processingResponse.data.success) {
                    setProcessingCount(processingResponse.data.processingOrdersCount);
                } else {
                    console.error('Failed to fetch processing orders count');
                }

                const shippedResponse = await axios.get('http://localhost:4000/shippedOrders');
                if (shippedResponse.data.success) {
                    setShippedCount(shippedResponse.data.shippedOrdersCount);
                } else {
                    console.error('Failed to fetch shipped orders count');
                }

                const deliveredResponse = await axios.get('http://localhost:4000/deliveredOrders');
                if (deliveredResponse.data.success) {
                    setDeliveredCount(deliveredResponse.data.deliveredOrdersCount);
                } else {
                    console.error('Failed to fetch delivered orders count');
                }
            } catch (error) {
                console.error('Error while fetching orders data:', error);
            }
        };

        fetchData();
    }, []);

    const fetchTotalAmount = async () => {
        try {
            const response = await axios.get('http://localhost:4000/totalAmountOfOrders');
            const { totalAmountOfOrders } = response.data;
            setTotalAmount(totalAmountOfOrders);
        } catch (error) {
            console.error('Error fetching total amount of orders:', error);
        }
    };

    fetchTotalAmount();

    const fetchTotalDeliveredAmount = async () => {
        try {
            const response = await axios.get('http://localhost:4000/totalAmountOfDelivered');
            const { totalAmountOfDeliveredOrders } = response.data;
            setTotalDeliveredAmount(totalAmountOfDeliveredOrders);
        } catch (error) {
            console.error('Error fetching total amount of orders:', error);
        }
    };

    fetchTotalDeliveredAmount();

    const fetchTotalPendingAmount = async () => {
        try {
            const response = await axios.get('http://localhost:4000/totalAmountOfPending');
            const { totalAmountOfPending } = response.data;
            setTotalPendingAmount(totalAmountOfPending);
        } catch (error) {
            console.error('Error fetching total amount of orders:', error);
        }
    };

    fetchTotalPendingAmount();


    const pieChartData = {
        series: [processingCount, shippedCount, deliveredCount],
        options: {
            labels: ['Processing', 'Shipped', 'Delivered'],
            colors: ['#FF6384', '#36A2EB', '#FFCE56'],
        },
    };
    return (
        <div className='onlineshop-section'>
            <h1 className='onlineshop-topic'>Online Shopping Status</h1>
            <div className='orders'>
                <h3 className='order-head'>Orders</h3>
                <div className='order-container'>
                    <div className='processing'>
                        <h4 className='head'>Processing Order Count:</h4>
                        <h4 className='count'>{processingCount}</h4>
                    </div>
                    <div className='shipped'>
                        <h4 className='head'>Shipped Order Count:</h4>
                        <h4 className='count'>{shippedCount}</h4>
                    </div>
                    <div className='delivered'>
                        <h4 className='head'>Delivered Order Count:</h4>
                        <h4 className='count'>{deliveredCount}</h4>
                    </div>
                </div>
            </div>
            <div className='ss'>
                <div className='sells'>
                    <h3 className='sells-topic'>Sells</h3>
                    <div className='sells-container'>
                        <div className='processing'>
                            <h2>Total Amount of Orders</h2>
                            <p>Rs.{totalAmount}</p>
                        </div>
                        <div className='delivered'>
                            <h2>Total Amount Recieved</h2>
                            <p>Rs.{totalDeliveredAmount}</p>
                        </div>
                        <div className='shipped'>
                            <h2>Total Pending Amount</h2>
                            <p>Rs.{totalPendingAmount}</p>
                        </div>
                    </div>
                </div>
                {processingCount !== 0 && shippedCount !== 0 && deliveredCount !== 0 && (
                <div className='chart'>
                    <h3 className='overview'>Orders Overview</h3>
                    <ReactApexChart options={pieChartData.options} series={pieChartData.series} type='pie' height={350} />
                </div>
                )}
            </div>
        </div>
    );
};

export default OnlineshopDb;
