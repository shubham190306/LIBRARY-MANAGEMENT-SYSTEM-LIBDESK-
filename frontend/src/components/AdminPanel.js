import React, { useState } from 'react';
import { Container, Tabs, Tab, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';

function AdminPanel() {
  const [key, setKey] = useState('addBook');
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    category: 'Computer Science',
    quantity: 1
  });
  const [memberData, setMemberData] = useState({
    name: '',
    email: '',
    phone: '',
    endDate: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const username = localStorage.getItem('username') || 'Admin';
  const navigate = useNavigate();

  const categories = [
    "Computer Science", "Electrical Engineering", "Mechanical Engineering", 
    "Civil Engineering", "Electronics", "Information Technology", "Chemical Engineering",
    "Biotechnology", "Aerospace Engineering", "Metallurgical Engineering"
  ];

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    document.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { type: 'info', message: 'Logged out', title: 'Logout' }
    }));
    setIsLoggedIn(false);
    navigate('/login', { replace: true });
  };

  const handleBookChange = (e) => {
    const { name, value } = e.target;
    setBookData({
      ...bookData,
      [name]: value
    });
  };

  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setMemberData({
      ...memberData,
      [name]: value
    });
  };

  const addBook = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setMessage({ text: 'Please log in to add books.', type: 'danger' });
      document.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { type: 'error', message: 'Login required to add books', title: 'Unauthorized' }
      }));
      return;
    }
    try {
      // Get the highest book_id to create a new one
      const booksResponse = await fetch('http://localhost:8000/api/books/');
      const booksData = await booksResponse.json();
      const highestId = Math.max(...booksData.map(book => book.book_id), 0);
      const newBookId = highestId + 1;
      
      // Create book in BookStock
      await fetch('http://localhost:8000/api/books/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: newBookId,
          quantity: parseInt(bookData.quantity)
        })
      });
      
      setMessage({
        text: `Book "${bookData.title}" by ${bookData.author} added successfully!`,
        type: 'success'
      });
      
      // Reset form
      setBookData({
        title: '',
        author: '',
        category: 'Computer Science',
        quantity: 1
      });
    } catch (error) {
      console.error('Error adding book:', error);
      setMessage({
        text: 'Failed to add book. Please try again.',
        type: 'danger'
      });
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setMessage({ text: 'Please log in to add members.', type: 'danger' });
      document.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { type: 'error', message: 'Login required to add members', title: 'Unauthorized' }
      }));
      return;
    }
    try {
      // Calculate joining date (today) and end date
      const joiningDate = new Date().toISOString().split('T')[0];
      const endDate = memberData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Create member
      await fetch('http://localhost:8000/api/members/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_name: memberData.name,
          member_email: memberData.email,
          member_phone: parseInt(memberData.phone),
          end_date: endDate,
          is_active: true,
          outstanding_debt: 0,
          books_issued: 0
        })
      });
      
      setMessage({
        text: `Member "${memberData.name}" added successfully!`,
        type: 'success'
      });
      
      // Reset form
      setMemberData({
        name: '',
        email: '',
        phone: '',
        endDate: ''
      });
    } catch (error) {
      console.error('Error adding member:', error);
      setMessage({
        text: 'Failed to add member. Please try again.',
        type: 'danger'
      });
    }
  };

  return (
    <div>
      <NavBar />
      <Container className="mt-4">
        <h2 className="mb-4">Admin Panel</h2>
        
        {message.text && (
          <Alert variant={message.type} onClose={() => setMessage({ text: '', type: '' })} dismissible>
            {message.text}
          </Alert>
        )}
        
        <Tabs
          id="admin-tabs"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-4"
        >
          <Tab eventKey="addBook" title="Add Book">
            <Form onSubmit={addBook}>
              <Form.Group className="mb-3">
                <Form.Label>Book Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={bookData.title}
                  onChange={handleBookChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Author</Form.Label>
                <Form.Control
                  type="text"
                  name="author"
                  value={bookData.author}
                  onChange={handleBookChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={bookData.category}
                  onChange={handleBookChange}
                  required
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={bookData.quantity}
                  onChange={handleBookChange}
                  min="1"
                  required
                />
              </Form.Group>
              
              <Button variant="primary" type="submit">
                Add Book
              </Button>
            </Form>
          </Tab>
          
          <Tab eventKey="addMember" title="Add Member">
            <Form onSubmit={addMember}>
              <Form.Group className="mb-3">
                <Form.Label>Member Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={memberData.name}
                  onChange={handleMemberChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={memberData.email}
                  onChange={handleMemberChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="number"
                  name="phone"
                  value={memberData.phone}
                  onChange={handleMemberChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Membership End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={memberData.endDate}
                  onChange={handleMemberChange}
                />
                <Form.Text className="text-muted">
                  If not specified, membership will be set for 1 year from today.
                </Form.Text>
              </Form.Group>
              
              <Button variant="primary" type="submit">
                Add Member
              </Button>
            </Form>
          </Tab>
          
          <Tab eventKey="settings" title="Settings">
            <h4>Library Settings</h4>
            <p>This section is under development. Future features will include:</p>
            <ul>
              <li>Fine rate configuration</li>
              <li>Maximum books per member</li>
              <li>Maximum loan period</li>
              <li>Email notification settings</li>
              <li>Backup and restore options</li>
            </ul>

            <hr />
            <h4>Account</h4>
            <p>Status: {isLoggedIn ? `Signed in as ${username}` : 'Not signed in'}</p>
            <div className="d-flex gap-2">
              {isLoggedIn ? (
                <Button variant="outline-secondary" onClick={handleLogout}>Logout</Button>
              ) : (
                <Button variant="primary" onClick={handleLogin}>Login</Button>
              )}
            </div>
          </Tab>
        </Tabs>
      </Container>
    </div>
  );
}

export default AdminPanel;