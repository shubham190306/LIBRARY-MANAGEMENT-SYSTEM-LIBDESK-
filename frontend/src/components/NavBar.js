import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SideNav from './SideNav';
import TopNav from './TopNav';

function NavBar() {
  return (
    <>
      <TopNav searchQuery="" setSearchQuery={() => {}} />
    </>
  );
}

export default NavBar;