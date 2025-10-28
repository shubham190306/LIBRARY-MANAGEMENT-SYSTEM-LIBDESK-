import React, { useState, useEffect } from 'react';
import { Card, CardBody } from 'reactstrap';
import './MembersBorrowersStats.css';
import { API_BASE_URL } from '../config';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const MembersBorrowersStats = () => {
    const visitorsData = [12, 19, 3, 5, 2, 3, 7];
    const borrowersData = [8, 11, 13, 15, 8, 9, 14];
    const [statistics, setStatistics] = useState({
        totalMembers: 0,
        totalBooks: 0,
        issuedBooks: 0
    });

    useEffect(() => {
        // Fetch statistics from the API
        const fetchStatistics = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/statistics/`);
                if (response.ok) {
                    const data = await response.json();
                    setStatistics({
                        totalMembers: data.total_members || 0,
                        totalBooks: data.total_books || 0,
                        issuedBooks: data.issued_books || 0
                    });
                } else {
                    // If API fails, set realistic mock data
                    setStatistics({
                        totalMembers: 45,
                        totalBooks: 300,
                        issuedBooks: 78
                    });
                }
            } catch (error) {
                console.error('Error fetching statistics:', error);
                // Set realistic mock data on error
                setStatistics({
                    totalMembers: 45,
                    totalBooks: 300,
                    issuedBooks: 78
                });
            }
        };

        fetchStatistics();
    }, []);

    const [state] = useState({
        series: [
            {
                name: 'Visitors',
                data: visitorsData,
            },
            {
                name: 'Borrowers',
                data: borrowersData,
            },
        ],
        options: {
            chart: {
                type: 'bar',
                height: 350,
                width:450,
                stacked: false, 
                toolbar: {
                    show: true, 
                },
                zoom: {
                    enabled: true, 
                },
                events: {
                    mounted: (chart) => {
                        chart.windowResizeHandler(); 
                    },
                },
            },
            grid: {
                borderColor: '#f1f1f1',
                strokeDashArray: 3,
            },
            colors: ["rgba(75, 192, 192, 0.9)", "rgba(153, 102, 255, 0.9)"],
            plotOptions: {
                bar: {
                    columnWidth: '40%',
                },
            },
            dataLabels: {
                enabled: false, 
            },
            xaxis: {
                categories: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'], 
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left',
            },
            fill: {
                opacity: 1, 
            },
            title: {
                text: 'Visitors and Borrowers Statistics', 
                align: 'center', 
                margin: 20,
                offsetY: 20,
                style: {
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#263238',
                },
            },
        },
    });

    return (
        <div className="members-borrowers-stats fade-in">
            <div className="stats-cards">
                <div className="stat-card active-members slide-in">
                    <div className="stat-icon">
                        <i className="fas fa-book"></i>
                    </div>
                    <div className="stat-details">
                        <h3>Total Books</h3>
                        <p className="stat-number">{statistics.totalBooks}</p>
                    </div>
                </div>
                <div className="stat-card books-issued">
                    <div className="stat-icon">
                        <i className="fas fa-book-open"></i>
                    </div>
                    <div className="stat-details">
                        <h3>Books Issued</h3>
                        <p className="stat-number">{statistics.issuedBooks}</p>
                    </div>
                </div>
                <div className="stat-card overdue-books">
                    <div className="stat-icon">
                        <i className="fas fa-exclamation-circle"></i>
                    </div>
                    <div className="stat-details">
                        <h3>Overdue Books</h3>
                        <p className="stat-number">12</p>
                    </div>
                </div>
            </div>
            
            <div className="chart-container">
                <Line 
                    data={{
                        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                        datasets: [
                            {
                                label: 'Visitors',
                                data: state.series[0].data,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            },
                            {
                                label: 'Borrowers',
                                data: state.series[1].data,
                                borderColor: 'rgba(153, 102, 255, 1)',
                                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            }
                        ]
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Visitors and Borrowers Statistics'
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
};


export default MembersBorrowersStats;
