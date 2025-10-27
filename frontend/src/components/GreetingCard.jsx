import React from 'react';
import { format } from 'date-fns';
import './GreetingCard.css';

const GreetingCard = () => {
  // Get today's date and time
  const now = new Date();
  const formattedDate = format(now, 'MMM dd, yyyy');
  const formattedTime = format(now, 'EEEE, hh:mm a');

  return (
    <div className="greeting-card">
      <div className="greeting-content">
        <h5>Hello, <span className="user-name">Librarian</span></h5>
        <p>{formattedDate} | {formattedTime}</p>
      </div>
      <div className="library-info-container">
        <div className="newly-added-books">
          <h6>Newly Added Books</h6>
          <div className="book-catalog">
            <div className="book">
              <div className="book-cover">
                <div className="book-spine"></div>
                <div className="book-title">Data Structures and Algorithms</div>
                <div className="book-author">Computer Science</div>
              </div>
            </div>
            <div className="book">
              <div className="book-cover">
                <div className="book-spine"></div>
                <div className="book-title">Machine Learning Engineering</div>
                <div className="book-author">Computer Science</div>
              </div>
            </div>
            <div className="book">
              <div className="book-cover">
                <div className="book-spine"></div>
                <div className="book-title">Digital Electronics</div>
                <div className="book-author">Electrical Engineering</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreetingCard;
