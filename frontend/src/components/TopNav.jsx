import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopNav.css';
import libdeskLogo from '../assets/libdesk-logo.svg';

const TopNav = ({ searchQuery = "", setSearchQuery = () => {} }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: '5 books are overdue today', type: 'overdue' },
    { id: 2, text: '3 new members joined this week', type: 'members' },
    { id: 3, text: 'Monthly report is ready', type: 'report' }
  ]);
  
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.toLowerCase();
      
      // Update the search query in the current component
      setSearchQuery(query);
      
      // Store the search query in localStorage for all pages
      localStorage.setItem('searchQuery', query);
    }
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  const handleAdminClick = () => {
    navigate('/admin');
  };
  
  const handleNotificationClick = (type) => {
    if (type === 'overdue') {
      navigate('/overdue');
    } else if (type === 'members') {
      navigate('/members');
    } else if (type === 'report') {
      navigate('/admin');
    }
    setShowNotifications(false);
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };
  
  return (
    <div className="topnav">
      <div className="logo-container">
        <img src={libdeskLogo} alt="LibDesk Logo" className="logo" />
      </div>
      <div className="topnav-search">
        <input 
          type="text" 
          placeholder="Search books or members..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>
      <div className="topnav-greeting">
      </div>
      <div className="topnav-icons">
        <div className="icon" onClick={toggleNotifications}>
          <i className="fas fa-bell"></i>
          {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
          {showNotifications && (
            <div className="notifications-dropdown">
              {notifications.length > 0 ? (
                <>
                  {notifications.map(notification => (
                    <div key={notification.id} className="notification-item" onClick={() => handleNotificationClick(notification.type)}>
                      <span>{notification.text}</span>
                    </div>
                  ))}
                  <div className="read-all-button" onClick={clearAllNotifications}>
                    Read All
                  </div>
                </>
              ) : (
                <div className="notification-item">
                  <span>No new notifications</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="icon" onClick={handleAdminClick}>
          <i className="fas fa-user"></i>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
