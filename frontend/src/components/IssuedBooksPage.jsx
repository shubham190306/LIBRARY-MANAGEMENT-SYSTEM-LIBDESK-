import React, { useState, useEffect } from 'react';
import { Card, CardBody, Table, Button } from 'reactstrap';
import './BooksIssued.css';
import SideNav from './SideNav';
import TopNav from './TopNav';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_BASE_URL } from '../config';

const IssuedBooksPage = () => {
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Fetch data from API
    const fetchIssuedBooks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/issued_books_list/`);
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

    useEffect(() => {
        fetchIssuedBooks();
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
                // Remove the book from the local state immediately
                setIssuedBooks(prevBooks => prevBooks.filter(book => book.book_id !== bookId));
                // Also refresh data from server
                fetchIssuedBooks();
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

    // Filter books based on search query
    const filteredBooks = issuedBooks.filter(book => {
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        return (
            (book.book_id && book.book_id.toString().toLowerCase().includes(query)) ||
            (book.issued_to_member && book.issued_to_member.toString().toLowerCase().includes(query)) ||
            (book.book_title && book.book_title.toLowerCase().includes(query))
        );
    });

    return (
        <div className="booksPageContainer">
            <SideNav />
            <div className="books-page-main-content">
                <TopNav searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <div className="books-page-card-main">
                    <div className="header-container">
                        <h2>Issued Books</h2>
                    </div>
                    <Card className="books-issued-card">
                        <CardBody>
                            <Table className="issuedTable" hover responsive>
                                <thead>
                                    <tr>
                                        <th>Book ID</th>
                                        <th>Book Title</th>
                                        <th>Member ID</th>
                                        <th>Issue Date</th>
                                        <th>Return Date</th>
                                        <th>Fine</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {filteredBooks.length > 0 ? (
                                    filteredBooks.map((book) => (
                                        <tr key={book.id}>
                                            <td>{book.book_id}</td>
                                            <td>{book.book_title || "Unknown"}</td>
                                            <td>{book.issued_to_member}</td>
                                            <td>{book.issue_date}</td>
                                            <td>{book.return_date || "Not returned yet"}</td>
                                            <td>{book.fine || "₹0"}</td>
                                            <td>
                                                <Button 
                                                    color="primary" 
                                                    size="sm" 
                                                    onClick={() => handleReturnBook(book.book_id)}
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
            </div>
        </div>
    );
}

export default IssuedBooksPage;