import React, { useState, useEffect } from 'react';
import { Card, CardBody, Table, Button } from 'reactstrap';
import './BooksIssued.css';
import { API_BASE_URL } from '../config';

const BooksIssued = ({ isPreview = true }) => {
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [statistics, setStatistics] = useState({
        total_members: 0,
        active_members: 0,
        issued_books: 0,
        returned_books: 0,
        total_books: 0,
        total_btech_books: 0
    });

    // Fetch data from API
    const fetchIssuedBooks = async () => {
        try {
            // If it's a preview, limit to 5 entries
            const url = isPreview 
                ? `${API_BASE_URL}/issued_books_list/?limit=5` 
                : `${API_BASE_URL}/issued_books_list/`;
                
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setIssuedBooks(data);
            } else {
                console.error('Error fetching issued books:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching issued books:', error);
        }
    };

    // Fetch statistics
    const fetchStatistics = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/statistics/`);
            if (response.ok) {
                const data = await response.json();
                setStatistics(data);
            } else {
                console.error('Error fetching statistics:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    useEffect(() => {
        fetchIssuedBooks();
        fetchStatistics();
    }, []); // Fetch data once when component mounts

    // Handle return book
    const handleReturnBook = async (bookId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/issued_books/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    book_id: bookId,
                }),
            });

            if (response.ok) {
                // Use toast notification instead of alert
                document.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { 
                        type: 'success', 
                        message: 'Book Returned Successfully',
                        title: 'Success'
                    } 
                }));
                // Refresh the data
                fetchIssuedBooks();
                fetchStatistics();
            } else {
                // Use toast notification for error
                document.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { 
                        type: 'error', 
                        message: 'Failed to Return Book',
                        title: 'Error'
                    } 
                }));
            }
        } catch (error) {
            console.error('Error returning book:', error);
            // Use toast notification for error
            document.dispatchEvent(new CustomEvent('show-toast', { 
                detail: { 
                    type: 'error', 
                    message: 'Error returning book',
                    title: 'Error'
                } 
            }));
        }
    };

    return (
        <div className="BooksIssuedContainer">
            
            <Card className="books-issued-card">
                <CardBody>
                    <div className="book-card-header">
                        <h2 className='books-issued-title'>Books Issued</h2>
                        {isPreview && (
                            <a href="/issued" className="addButton">
                                View All
                            </a>
                        )}
                    </div>
                    <Table className="issuedTable" hover responsive>
                        <thead>
                            <tr>
                                <th>Book ID</th>
                                <th>Member ID</th>
                                <th>Issue Date</th>
                                <th>Return Date</th>
                                <th>Fine</th>
                                <th>Details</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                        {issuedBooks.length > 0 ? (
                            issuedBooks.map((book) => (
                                <tr key={book.id}>
                                    <td>{book.book_id}</td>
                                    <td>{book.issued_to_member}</td>
                                    <td>{book.issue_date}</td>
                                    <td>{book.return_date || "Not returned yet"}</td>
                                    <td>{book.fine || "₹0"}</td>
                                    <td><span className="view-details" onClick={() => window.location.href = `/members`}>View Details</span></td>
                                    <td>
                                        <Button 
                                            color="primary" 
                                            size="sm" 
                                            onClick={() => {
                                                handleReturnBook(book.book_id);
                                                // Immediately remove the book from the UI
                                                setIssuedBooks(issuedBooks.filter(b => b.book_id !== book.book_id));
                                            }}
                                        >
                                            Return Book
                                        </Button>
                                    </td>
                                </tr>
                            ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-books-available">
                                        No Books Issued
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    );
}

export default BooksIssued;
