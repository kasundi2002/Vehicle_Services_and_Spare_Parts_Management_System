import React from 'react';
import { Line } from "react-chartjs-2";
import { Chart as chartjs, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

chartjs.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function LineChart() {
    const labels = Utils.months({ count: 7 });
    const data = {
        labels: labels,
        datasets: [{
            label: 'My First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };
    const options = {}; // You can define options for your chart here

    return (
        <div>
            <Line data={data} options={options} />
        </div>
    );
}

export default LineChart;
