import React, { useState } from 'react';
import Books from './Books';
import Members from './Members';
import './HomePage.css';
import SideNav from './SideNav';
import TopNav from './TopNav';
import 'bootstrap/dist/css/bootstrap.min.css';
import Statistics from './Statistics';
import TopChoices from './TopChoices';
import OverdueBookList from './OverdueBookList';
import { BookProvider } from './BookContext'; // Import the provider
import GreetingCard from './GreetingCard';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <BookProvider> {/* Wrap with BookProvider */}
      <div className="homePageContainer">
        <SideNav />
        <div className="main-content">
          <TopNav searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

          <div className="container">
            {/* Greeting Card */}
            <GreetingCard />

            {/* Statistics Section */}
            <Statistics />

            {/* Members and Books Section */}
            <div className="card-main-home">
              <Members />

              <div className="card">
                <div className="book-card-header">
                  <h4 className="card-title">Books</h4>
                  <button className="addButton" onClick={() => window.location.href = '/admin'}>Add Book</button>
                </div>
                <Books />
              </div>
            </div>

            <TopChoices />

            <OverdueBookList />
          </div>
        </div>
      </div>
    </BookProvider>
  );
};

export default HomePage;
