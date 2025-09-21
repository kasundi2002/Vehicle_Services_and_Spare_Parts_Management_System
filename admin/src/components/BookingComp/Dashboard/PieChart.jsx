import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function BasicPie({ bookingCounts }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        const myCartRef = chartRef.current.getContext("2d");

        chartInstance.current = new Chart(myCartRef, {
            type: 'pie',
            data: {
                labels: ['Pending', 'Accepted', 'Completed'],
                datasets: [{
                    label: '# of Bookings',
                    data: [bookingCounts.pending, bookingCounts.accepted, bookingCounts.completed],
                    backgroundColor: [
                        'rgb(255, 205, 86)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 99, 132)'
                    ],
                }]
            },
        });
    }, [bookingCounts]);
    
    return (
        <div>
            <canvas ref={chartRef} />
        </div>
    );
}
