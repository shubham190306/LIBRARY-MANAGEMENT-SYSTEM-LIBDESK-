import os
import django
import json
import random
from datetime import datetime, timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_backend.settings')
django.setup()

from api.models import BookStock, IssuedBooks, Members

# Clear existing books
BookStock.objects.all().delete()

# B.Tech subjects and publishers
subjects = [
    "Data Structures", "Algorithms", "Computer Networks", "Database Systems", 
    "Operating Systems", "Software Engineering", "Web Development", "Mobile Development",
    "Artificial Intelligence", "Machine Learning", "Computer Graphics", "Computer Architecture",
    "Digital Electronics", "Microprocessors", "Control Systems", "Signal Processing",
    "Power Systems", "Electric Circuits", "Electromagnetics", "Communication Systems",
    "Thermodynamics", "Fluid Mechanics", "Strength of Materials", "Engineering Mechanics",
    "Manufacturing Processes", "CAD/CAM", "Robotics", "Automation", "Material Science",
    "Engineering Mathematics", "Engineering Physics", "Engineering Chemistry"
]

publishers = [
    "Pearson Education", "McGraw Hill Education", "Wiley India", "Cengage Learning",
    "Oxford University Press", "Cambridge University Press", "Springer", "Elsevier",
    "PHI Learning", "Tata McGraw Hill", "Technical Publications", "Khanna Publishers",
    "S. Chand Publishing", "Laxmi Publications", "New Age International", "Universities Press",
    "BPB Publications", "Dhanpat Rai Publications", "Arihant Publications", "Ane Books"
]

# Generate 300 B.Tech books
books = []
for i in range(1, 301):
    subject = random.choice(subjects)
    publisher = random.choice(publishers)
    publication_year = random.randint(2010, 2024)
    edition = random.randint(1, 6)
    price = random.randint(300, 1500)
    quantity = random.randint(1, 10)
    
    # Generate ISBN (13 digits)
    isbn = f"978-{random.randint(1000000000, 9999999999)}"
    
    book = {
        "book_id": i,
        "title": f"B.Tech {subject} - {'Fundamentals' if i % 4 == 0 else 'Advanced' if i % 4 == 1 else 'Principles' if i % 4 == 2 else 'Applications'}",
        "author": f"Dr. {'John' if i % 3 == 0 else 'Sarah' if i % 3 == 1 else 'Michael'} {'Smith' if i % 5 == 0 else 'Johnson' if i % 5 == 1 else 'Williams' if i % 5 == 2 else 'Brown' if i % 5 == 3 else 'Davis'}",
        "category": "B.Tech",
        "subject": subject,
        "publisher": publisher,
        "publication_year": publication_year,
        "edition": edition,
        "isbn": isbn,
        "price": price,
        "quantity": quantity
    }
    books.append(book)
    
    # Save to BookStock model
    book_stock = BookStock(
        book_id=i,
        quantity=quantity
    )
    book_stock.save()

# Save books to a JSON file
with open('books_data.json', 'w') as f:
    json.dump(books, f, indent=4)

print(f"Created {len(books)} B.Tech books successfully.")

# Now let's assign books to members randomly
members = list(Members.objects.all())
if members:
    # Clear existing issued books
    IssuedBooks.objects.all().delete()
    
    # Reset books_issued count for all members
    for member in members:
        member.books_issued = 0
        member.save()
    
    # Assign books to random members
    for i in range(50):  # Assign 50 books randomly
        if not books:
            break
            
        book = random.choice(books)
        member = random.choice(members)
        
        # Calculate dates
        today = datetime.now().date()
        issue_date = today - timedelta(days=random.randint(1, 30))
        return_date = issue_date + timedelta(days=random.randint(7, 21))
        
        # Create issued book record
        issued_book = IssuedBooks(
            book_id=book["book_id"],
            book_title=book["title"],
            book_author=book["author"],
            issued_to_member=member,
            issue_date=issue_date,
            return_date=return_date,
            status="Issued"
        )
        issued_book.save()
        
        # Update member's books_issued count
        member.books_issued += 1
        member.save()
    
    print(f"Assigned books to members successfully.")
    
    # Add random dues to some members
    for member in random.sample(members, len(members) // 3):  # Add dues to 1/3 of members
        member.outstanding_debt = random.randint(50, 500)
        member.save()
    
    print(f"Added random dues to some members successfully.")
else:
    print("No members found in the database.")

print("Database update completed successfully.")