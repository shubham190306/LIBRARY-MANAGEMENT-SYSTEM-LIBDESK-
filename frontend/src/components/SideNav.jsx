import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './SideNav.css';
import { LuLayoutDashboard } from "react-icons/lu";
import { PiBooks } from "react-icons/pi";
import { GoPeople } from "react-icons/go";
import { LuBellRing } from "react-icons/lu";
import { BiBookReader } from "react-icons/bi";

import libdeskLogo from '../assets/libdesk-logo.svg'

const SideNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="sidenav">
      <img src={libdeskLogo} alt='LibDesk Logo' className="sidenav-logo"/>
      <Link to='/' className={currentPath === '/' ? 'active' : ''}>
        <LuLayoutDashboard />
        <span>Home</span>
      </Link>
      <Link to="/books" className={currentPath === '/books' ? 'active' : ''}>
        <PiBooks />
        <span>Books</span>
      </Link>
      <Link to="/members" className={currentPath === '/members' ? 'active' : ''}>
        <GoPeople />
        <span>Members</span>
      </Link>
      <Link to="/issued" className={currentPath === '/issued' ? 'active' : ''}>
        <BiBookReader />
        <span>Issued Books</span>
      </Link>
      <Link to="/dues" className={currentPath === '/dues' ? 'active' : ''}>
        <LuBellRing />
        <span>Dues</span>
      </Link>
    </div>
  );
};

export default SideNav;
