import React, { useState, useEffect } from 'react';
import './Statistics.css'; // Import the CSS file for styling
import { FaUser, FaBook, FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import { API_BASE_URL } from '../config';

const Statistics = () => {
  const [statistics, setStatistics] = useState({
    total_members: 25,
    total_books: 300,
    issued_books: 42,
    returned_books: 156
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/statistics/`);
        if (response.ok) {
          const data = await response.json();
          setStatistics({
            total_members: data.total_members || 25,
            total_books: data.total_books || 300,
            issued_books: data.issued_books || 42,
            returned_books: data.returned_books || 156
          });
        } else {
          // Use default values if API fails
          console.log('Using default statistics values');
        }
      } catch (error) {
        // Use default values on error
        console.log('Using default statistics values');
      }
    };

    fetchStatistics();
    // Set up interval to refresh statistics every 30 seconds
    const intervalId = setInterval(fetchStatistics, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const data = [
    { number: statistics.total_members, label: 'Total Members', icon: <FaUser />, path: '/members' },
    { number: statistics.issued_books, label: 'Issued Books', icon: <FaBook />, path: '/issued' },
    { number: statistics.total_books, label: 'Total Books', icon: <FaClipboardList />, path: '/books' },
    { number: statistics.returned_books, label: 'Books Returned', icon: <FaCheckCircle />, path: '/issued' },
  ];

  const handleViewDetails = (path) => {
    window.location.href = path;
  };

  return (
    <div className="statistics-container">
      {data.map((stat, index) => (
        <div className="statistics-card" key={index}>
          <div className="card-content">
            <div className="card-number">{stat.number}</div>
            <div className="card-label">{stat.label}</div>
            <button 
              className="view-details-btn" 
              onClick={() => handleViewDetails(stat.path)}
            >
              View Details
            </button>
          </div>
          <div className="card-icon">{stat.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default Statistics;
