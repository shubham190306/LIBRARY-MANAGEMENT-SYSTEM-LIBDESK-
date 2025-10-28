import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import NavBar from './NavBar';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function StatisticsPage() {
  const [statistics, setStatistics] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalBooks: 0,
    issuedBooks: 0,
    overdueBooks: 0,
    totalDues: 0,
    topCategories: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Fetch members data
      const membersResponse = await axios.get(`${API_BASE_URL}/api/members/`);
      const members = membersResponse.data;
      
      // Fetch issued books data
      const issuedBooksResponse = await axios.get(`${API_BASE_URL}/api/issued-books/`);
      const issuedBooks = issuedBooksResponse.data;
      
      // Calculate statistics
      const activeMembers = members.filter(member => member.is_active).length;
      const overdueBooks = issuedBooks.filter(book => book.overdue > 0 && book.status === 'Issued').length;
      const totalDues = members.reduce((sum, member) => sum + member.outstanding_debt, 0);
      
      // Get book categories (from the first 5 issued books for demo)
      const categories = {};
      issuedBooks.forEach(book => {
        // Extract category from book title (assuming format like "Category - Title")
        const category = book.book_title.split(' - ')[0];
        categories[category] = (categories[category] || 0) + 1;
      });
      
      // Sort categories by count and take top 5
      const topCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      
      // Recent activity (last 5 issued books)
      const recentActivity = issuedBooks
        .sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date))
        .slice(0, 5);
      
      setStatistics({
        totalMembers: members.length,
        activeMembers,
        totalBooks: 200, // We added 200 books in our script
        issuedBooks: issuedBooks.filter(book => book.status === 'Issued').length,
        overdueBooks,
        totalDues,
        topCategories,
        recentActivity
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  // Prepare chart data
  const pieChartData = {
    labels: ['Available Books', 'Issued Books', 'Overdue Books'],
    datasets: [
      {
        data: [
          statistics.totalBooks - statistics.issuedBooks,
          statistics.issuedBooks - statistics.overdueBooks,
          statistics.overdueBooks
        ],
        backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
        hoverBackgroundColor: ['#36A2EB', '#FFCE56', '#FF6384'],
      },
    ],
  };

  const barChartData = {
    labels: statistics.topCategories.map(cat => cat.name),
    datasets: [
      {
        label: 'Number of Books',
        data: statistics.topCategories.map(cat => cat.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <NavBar />
      <Container className="mt-4">
        <h2 className="mb-4">Library Statistics</h2>
        
        {loading ? (
          <p>Loading statistics...</p>
        ) : (
          <>
            <Row className="mb-4">
              <Col md={4}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <Card.Title>Members</Card.Title>
                    <h1>{statistics.totalMembers}</h1>
                    <p>{statistics.activeMembers} active members</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <Card.Title>Books</Card.Title>
                    <h1>{statistics.totalBooks}</h1>
                    <p>{statistics.issuedBooks} currently issued</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center h-100">
                  <Card.Body>
                    <Card.Title>Outstanding Dues</Card.Title>
                    <h1>₹{statistics.totalDues}</h1>
                    <p>{statistics.overdueBooks} overdue books</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Row className="mb-4">
              <Col md={6}>
                <Card>
                  <Card.Body>
                    <Card.Title>Book Status</Card.Title>
                    <div style={{ height: '300px' }}>
                      <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card>
                  <Card.Body>
                    <Card.Title>Top Book Categories</Card.Title>
                    <div style={{ height: '300px' }}>
                      <Bar 
                        data={barChartData} 
                        options={{ 
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true
                            }
                          }
                        }} 
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <Row>
              <Col>
                <Card>
                  <Card.Body>
                    <Card.Title>Recent Activity</Card.Title>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Book</th>
                          <th>Member</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statistics.recentActivity.map((activity, index) => (
                          <tr key={index}>
                            <td>{new Date(activity.issue_date).toLocaleDateString()}</td>
                            <td>{activity.book_title}</td>
                            <td>{activity.issued_to_member}</td>
                            <td>
                              <span className={`badge ${activity.status === 'Issued' ? 'bg-warning' : 'bg-success'}`}>
                                {activity.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

export default StatisticsPage;