import React, { useState, useEffect } from 'react';
import './DBoardCont.css';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; 
import AnnouncementIcon from '@mui/icons-material/Announcement';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PieChart from '../PieChart';
import axios from 'axios';


function DBoardCont() {
    const [bookingCounts, setBookingCounts] = useState({ pending: 0, accepted: 0, completed: 0 });

    useEffect(() => {
        // Fetch booking data
        axios.get('https://vehicle-sever.onrender.com/allBookingRequest')
            .then(response => {
                const data = response.data;
                const counts = {
                    pending: data.filter(booking => booking.status === 'pending').length,
                    accepted: data.filter(booking => booking.status === 'accepted').length,
                    completed: data.filter(booking => booking.status === 'completed').length
                };
                setBookingCounts(counts);
            })
            .catch(error => {
                console.error('Error fetching booking data:', error);
            });
    }, []);

    return (
        <div className='DboardCont'>
            <div className='cards-container'>
                <div className='card1'>
                    <CalendarMonthIcon style={{fontSize:'60px'}}/>
                    <h3>Pending</h3>
                    <h1>{bookingCounts.pending}</h1>
                </div>
                <div className='card2'>
                    <AnnouncementIcon style={{fontSize:'60px'}}/>  
                    <h3>Rejected</h3>
                    <h1>0</h1>
                </div>
                <div className='card3'>
                    <TrendingUpIcon style={{fontSize:'60px'}}/>
                    <h3>Accepted</h3>
                    <h1>{bookingCounts.accepted}</h1>
                </div>
                <div className='card4'>
                    <AssignmentTurnedInIcon style={{fontSize:'60px'}}/>
                    <h3>Finished</h3>
                    <h1>{bookingCounts.completed}</h1>
                </div>
            </div>

            <div className='chart-container-full'>
                <div className='chart'>
                    <h2>Booking Summary</h2>
                </div>
                <div className='chart-container'>
                    <PieChart bookingCounts={bookingCounts} />
                </div>
                <div className='Total-Num'>
                        <h2 className='totbname'>Total Bookings</h2>
                        <h1 className='totb'>{bookingCounts.pending + bookingCounts.accepted + bookingCounts.completed}</h1>
                    </div>
            </div>    

       
        </div>
    );
}

export default DBoardCont;
