import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { Container, Card, Table, Button, Row, Col } from 'react-bootstrap';
import './DuesPage.css';

function DuesPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/members_page/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Filter members with outstanding_debt > 0
        const membersList = data.members || [];
        setMembers(membersList.filter(member => member.outstanding_debt > 0));
      } catch (error) {
        console.error('Error fetching members with dues:', error);
        setError('Failed to load members with outstanding dues. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [refreshTrigger]);

  const handleSettleDues = async (memberId, amount) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/members/${memberId}/settle_dues/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Immediately remove the member from the list
      setMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
      // Also refresh the member list from server
      setRefreshTrigger(prev => prev + 1);
      
      // Use toast notification instead of alert
      document.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          type: 'success', 
          message: 'Dues settled successfully!',
          title: 'Success'
        } 
      }));
    } catch (error) {
      console.error('Error settling dues:', error);
      
      // Use toast notification for error
      document.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          type: 'error', 
          message: 'Failed to settle dues. Please try again.',
          title: 'Error'
        } 
      }));
    }
  };

  return (
    <div>
      <NavBar />
      <Container className="mt-4">
        <h2 className="mb-4">Outstanding Dues</h2>
        
        {loading ? (
          <p>Loading dues information...</p>
        ) : members.length === 0 ? (
          <Card className="text-center p-4">
            <Card.Body>
              <Card.Title>No Outstanding Dues</Card.Title>
              <Card.Text>All members have settled their dues.</Card.Text>
            </Card.Body>
          </Card>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Name</th>
                <th>Outstanding Amount (₹)</th>
                <th>Last Settlement Date</th>
                <th>Last Settled Amount (₹)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.member_id}>
                  <td>{member.member_id}</td>
                  <td>{member.member_name}</td>
                  <td className="text-danger">₹{member.outstanding_debt}</td>
                  <td>{member.last_settlement_date || 'Never'}</td>
                  <td>{member.last_settled_amount ? `₹${member.last_settled_amount}` : '-'}</td>
                  <td>
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => handleSettleDues(member.member_id, member.outstanding_debt)}
                    >
                      Settle Dues
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        
        <Row className="mt-4">
          <Col md={6}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Dues Policy</Card.Title>
                <div className="card-text-content">
                  <ul>
                    <li>Overdue books incur a fine of ₹10 per day.</li>
                    <li>Members cannot issue new books if outstanding dues exceed ₹500.</li>
                    <li>Membership may be suspended if dues remain unpaid for more than 30 days.</li>
                  </ul>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <Card.Title>Settlement Instructions</Card.Title>
                <div className="card-text-content">
                  <ol>
                    <li>Collect the outstanding amount from the member.</li>
                    <li>Click the "Settle Dues" button to record the payment.</li>
                    <li>Provide a receipt to the member for their records.</li>
                  </ol>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default DuesPage;