import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import './Books.css';
import { useBookContext } from './BookContext';
import { API_BASE_URL } from '../config';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [modal, setModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [memberId, setMemberId] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [message, setMessage] = useState('');
  const [showMessageOnly, setShowMessageOnly] = useState(false); // New state for message-only view
  const { triggerRefresh } = useBookContext(); // Use context

  // Add Book modal state
  const [addBookModal, setAddBookModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookPublisher, setBookPublisher] = useState('');
  const [bookYear, setBookYear] = useState('');
  const [bookIsbn, setBookIsbn] = useState('');
  const [bookCopies, setBookCopies] = useState('1');

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      // Reset the state when closing the modal
      setSelectedBook(null);
      setMessage('');
      setShowMessageOnly(false);
    }
  };

  const toggleAddBookModal = () => {
    setAddBookModal(!addBookModal);
    setSuccessMessage('');
  };

  const handleAddBook = (e) => {
    e.preventDefault();
    const newBook = {
      bookID: `TEMP-${Date.now()}`,
      title: bookTitle,
      authors: bookAuthor,
      average_rating: 0,
      publisher: bookPublisher,
      publication_date: bookYear,
      isbn: bookIsbn,
      status: 'Available',
    };
    setBooks((prev) => [newBook, ...prev]);
    setSuccessMessage('New Book Added Successfully');
    setTimeout(() => {
      toggleAddBookModal();
    }, 1500);
    setBookTitle('');
    setBookAuthor('');
    setBookPublisher('');
    setBookYear('');
    setBookIsbn('');
    setBookCopies('1');
  };

  const handleRowClick = (book) => {
    setSelectedBook(book);
    setMessage(''); // Clear any existing messages
    setShowMessageOnly(false); // Ensure the full modal view is shown
    toggleModal();
  };

  const handleIssue = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/issued_books/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: selectedBook.bookID,
          book_title: selectedBook.title,
          book_author: selectedBook.authors,
          issued_to_member: memberId,
          return_date: returnDate,
          status: "Issued",
        }),
      });

      if (response.ok) {
        setMessage('Book Issued Successfully'); // Set success message
        setShowMessageOnly(true); // Show message only view
        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.bookID === selectedBook.bookID ? { ...book, status: 'Issued' } : book
          )
        );
        triggerRefresh(); // Trigger refresh
      } else {
        setMessage('Failed to Issue Book'); // Set error message
      }
    } catch (error) {
      console.error('Error issuing book:', error);
      setMessage('Error issuing book');
    }
  };

  const handleReturn = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/issued_books/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: selectedBook.bookID,
        }),
      });

      if (response.ok) {
        setMessage('Book Returned Successfully'); // Set success message
        setShowMessageOnly(true); // Show message only view
        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.bookID === selectedBook.bookID ? { ...book, status: 'Available' } : book
          )
        );
        triggerRefresh(); // Trigger refresh
      } else {
        setMessage('Failed to Return Book'); // Set error message
      }
    } catch (error) {
      console.error('Error returning book:', error);
      setMessage('Error returning book');
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/books/?count=5`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBooks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching books:', error);
        setMessage('Error loading books. Please try again later.');
      }
    };

    fetchBooks();
  }, [triggerRefresh]);

  return (
    <div className="BooksContainer">
      <div className="books-header">
        <Button className="addButton" onClick={toggleAddBookModal}>Add Book</Button>
      </div>
      <Table className="booksTable" hover>
        <thead>
          <tr>
            <th>BookId</th>
            <th>Title</th>
            <th>Author</th>
            <th>Total</th>
            <th>Available</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {books.length > 0 ? (
            books.map((book) => (
              <tr key={book.bookID} onClick={() => handleRowClick(book)}>
                <td>{book.bookID}</td>
                <td>{book.title}</td>
                <td>{book.authors}</td>
                <td>{book.total_copies || 1}</td>
                <td>{book.available_copies !== undefined ? book.available_copies : 1}</td>
                <td>
                  <span className={`status-badge ${book.status === 'Available' ? 'status-available' : 'status-issued'}`}>
                    {book.status === 'Available' ? (
                      <><i className="fas fa-check-circle"></i> Available</>
                    ) : (
                      <><i className="fas fa-clock"></i> Issued</>
                    )}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-books-available">
                No Books Available
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal isOpen={modal} toggle={toggleModal}>
        <ModalHeader toggle={toggleModal}>
          {showMessageOnly ? '' : (selectedBook ? selectedBook.title : '')}
        </ModalHeader>
        <ModalBody>
          {showMessageOnly ? (
            <p className="message">{message}</p> // Display message only
          ) : (
            <>
              {selectedBook && (
                <>
                  <p><strong>Author:</strong> {selectedBook.authors}</p>
                  <p><strong>Year:</strong> {selectedBook.publication_date}</p>
                  <p><strong>Total Copies:</strong> {selectedBook.total_copies || 1}</p>
                  <p><strong>Available Copies:</strong> {selectedBook.available_copies !== undefined ? selectedBook.available_copies : 1}</p>
                  <p><strong>Issued Copies:</strong> {selectedBook.issued_copies || 0}</p>
                  <p><strong>Status:</strong> <span className={`status-badge ${selectedBook.status === 'Available' ? 'status-available' : 'status-issued'}`}>{selectedBook.status}</span></p>

                  {selectedBook.status === 'Available' && (selectedBook.available_copies === undefined || selectedBook.available_copies > 0) ? (
                    <>
                      <div>
                        <label><b>Member ID: </b></label>
                        <input
                          type="text"
                          value={memberId}
                          onChange={(e) => setMemberId(e.target.value)}
                        />
                      </div>
                      <div>
                        <label><b>Return Date: </b></label>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <p>Book is currently issued.</p>
                  )}
                </>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          {!showMessageOnly && (selectedBook?.status === 'Available' ? (
            <Button color="primary" onClick={handleIssue}>Issue</Button>
          ) : (
            <Button color="secondary" onClick={handleReturn}>Return</Button>
          ))}
          <Button color="secondary" onClick={toggleModal}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* Modal for adding a book */}
      <Modal isOpen={addBookModal} toggle={toggleAddBookModal}>
        <ModalHeader toggle={toggleAddBookModal}>Add Book</ModalHeader>
        <Form onSubmit={handleAddBook}>
          <ModalBody>
            {successMessage ? (
              <p className="message">{successMessage}</p>
            ) : (
              <>
                <FormGroup>
                  <Label for="bookTitle">Title</Label>
                  <Input
                    type="text"
                    id="bookTitle"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="bookAuthor">Author</Label>
                  <Input
                    type="text"
                    id="bookAuthor"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="bookPublisher">Publisher</Label>
                  <Input
                    type="text"
                    id="bookPublisher"
                    value={bookPublisher}
                    onChange={(e) => setBookPublisher(e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="bookYear">Publication Year</Label>
                  <Input
                    type="number"
                    id="bookYear"
                    value={bookYear}
                    onChange={(e) => setBookYear(e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="bookIsbn">ISBN</Label>
                  <Input
                    type="text"
                    id="bookIsbn"
                    value={bookIsbn}
                    onChange={(e) => setBookIsbn(e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="bookCopies">Number of Copies</Label>
                  <Input
                    type="number"
                    id="bookCopies"
                    value={bookCopies}
                    onChange={(e) => setBookCopies(e.target.value)}
                    min="1"
                    required
                  />
                </FormGroup>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleAddBookModal}>Cancel</Button>
            {!successMessage && (
              <Button color="primary" type="submit">Add Book</Button>
            )}
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default Books;
