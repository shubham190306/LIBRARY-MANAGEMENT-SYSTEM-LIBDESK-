# Book Copies System - Setup Instructions

## Changes Made

The library system now supports multiple copies of the same book!

### Backend Changes:
1. **BookStock model** - Tracks quantity of each book
2. **Updated BooksListAPI** - Returns `total_copies`, `available_copies`, and `issued_copies` for each book
3. **Updated IssuedBooksAPI** - Validates available copies before issuing a book
4. **Auto-creation** - Books are automatically added to BookStock with 1 copy when first accessed

### Frontend Changes:
1. **BooksPage table** - Now shows "Total Copies" and "Available" columns
2. **Book modal** - Displays copy information (total, available, issued)
3. **Issue button** - Only enabled when copies are available

## Setup Steps

### 1. Run Database Migrations

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### 2. Restart Django Server

```bash
python manage.py runserver
```

### 3. Restart React Frontend

```bash
cd ../frontend
npm start
```

## How It Works

- **Default**: Each book starts with 1 copy
- **Issuing**: Librarian can issue a book if `available_copies > 0`
- **Status**: 
  - "Available" if any copies are available
  - "Issued" if all copies are issued
- **Returning**: When a book is returned, available_copies increases by 1

## Managing Book Quantities

To add more copies of a book, you can:

1. **Via Django Admin** (recommended):
   - Create a superuser: `python manage.py createsuperuser`
   - Go to http://127.0.0.1:8000/admin
   - Navigate to BookStock
   - Update the quantity for any book

2. **Via Django Shell**:
   ```python
   python manage.py shell
   from api.models import BookStock
   
   # Update a specific book
   book = BookStock.objects.get(book_id=YOUR_BOOK_ID)
   book.quantity = 5  # Set to desired number
   book.save()
   ```

## Example Scenario

- Book ID: 123 has 3 copies (total_copies = 3)
- 2 copies are issued (issued_copies = 2)
- 1 copy is available (available_copies = 1)
- Status: "Available" (because available_copies > 0)
- When the 3rd copy is issued, status becomes "Issued"
- When any copy is returned, status changes back to "Available"
