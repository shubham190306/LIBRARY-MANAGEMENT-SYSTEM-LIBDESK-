import os
import sys
import django
import random
from datetime import datetime, timedelta
import json

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_backend.settings')
django.setup()

from api.models import Members, IssuedBooks, BookStock
from django.db import transaction

# Clear existing data
def clear_existing_data():
    print("Clearing existing data...")
    IssuedBooks.objects.all().delete()
    Members.objects.all().delete()
    BookStock.objects.all().delete()
    print("Data cleared successfully.")

# Indian names for members
indian_first_names = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Ayaan", "Atharva", 
    "Krishna", "Ishaan", "Shaurya", "Advait", "Dhruv", "Kabir", "Ansh", "Sai", 
    "Aryan", "Pranav", "Ritvik", "Rudra", "Aanya", "Saanvi", "Aadhya", "Aaradhya", 
    "Ananya", "Pari", "Anika", "Navya", "Diya", "Avni", "Myra", "Sara", "Ishita", 
    "Riya", "Shreya", "Tanvi", "Vanya", "Neha", "Nisha", "Trisha"
]

indian_last_names = [
    "Sharma", "Verma", "Patel", "Gupta", "Singh", "Kumar", "Joshi", "Rao", "Reddy", 
    "Malhotra", "Chopra", "Nair", "Mehta", "Shah", "Agarwal", "Iyer", "Pillai", 
    "Desai", "Kulkarni", "Chauhan", "Kapoor", "Yadav", "Patil", "Tiwari", "Jain", 
    "Chowdhury", "Chatterjee", "Banerjee", "Mukherjee", "Das", "Bose", "Dutta", 
    "Kaur", "Bhatia", "Malik", "Gill", "Talwar", "Hegde", "Nayak", "Menon"
]

# Generate random Indian phone number
def generate_phone():
    return random.randint(6000000000, 9999999999)

# Generate random email
def generate_email(name):
    domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"]
    name_part = name.lower().replace(" ", ".")
    return f"{name_part}{random.randint(1, 999)}@{random.choice(domains)}"

# Create members
def create_members(count=30):
    print(f"Creating {count} members...")
    members = []
    
    for _ in range(count):
        first_name = random.choice(indian_first_names)
        last_name = random.choice(indian_last_names)
        full_name = f"{first_name} {last_name}"
        
        # Random joining date within the last 2 years
        joining_date = datetime.now() - timedelta(days=random.randint(1, 730))
        # Membership for 1-3 years from joining date
        end_date = joining_date + timedelta(days=random.randint(365, 365*3))
        
        # Random last settlement date within the last 6 months
        last_settlement_date = datetime.now() - timedelta(days=random.randint(1, 180))
        
        member = Members(
            member_name=full_name,
            member_email=generate_email(full_name),
            member_phone=generate_phone(),
            joining_date=joining_date,
            end_date=end_date,
            is_active=True,
            outstanding_debt=random.randint(0, 500),
            books_issued=0,  # Will be updated when issuing books
            last_settlement_date=last_settlement_date,
            last_settled_amount=random.randint(100, 1000)
        )
        member.save()
        members.append(member)
    
    print(f"Created {len(members)} members successfully.")
    return members

# BTech book categories and subjects
btech_categories = [
    "Computer Science", "Electrical Engineering", "Mechanical Engineering", 
    "Civil Engineering", "Electronics", "Information Technology", "Chemical Engineering",
    "Biotechnology", "Aerospace Engineering", "Metallurgical Engineering"
]

btech_subjects = {
    "Computer Science": [
        "Data Structures and Algorithms", "Database Management Systems", "Operating Systems",
        "Computer Networks", "Software Engineering", "Web Development", "Artificial Intelligence",
        "Machine Learning", "Computer Graphics", "Compiler Design", "Theory of Computation",
        "Distributed Systems", "Cloud Computing", "Cybersecurity", "Mobile App Development",
        "Big Data Analytics", "Natural Language Processing", "Computer Architecture", "Blockchain"
    ],
    "Electrical Engineering": [
        "Circuit Theory", "Electromagnetic Fields", "Power Systems", "Control Systems",
        "Digital Electronics", "Analog Electronics", "Microprocessors", "Electric Machines",
        "Power Electronics", "High Voltage Engineering", "Electrical Measurements",
        "Renewable Energy Systems", "Smart Grid Technology", "Electric Drives"
    ],
    "Mechanical Engineering": [
        "Thermodynamics", "Fluid Mechanics", "Strength of Materials", "Machine Design",
        "Heat Transfer", "Manufacturing Processes", "Robotics", "Automobile Engineering",
        "CAD/CAM", "Industrial Engineering", "Refrigeration and Air Conditioning",
        "Mechatronics", "Finite Element Analysis", "Vibration Analysis"
    ],
    "Civil Engineering": [
        "Structural Analysis", "Geotechnical Engineering", "Transportation Engineering",
        "Environmental Engineering", "Surveying", "Concrete Technology", "Hydraulics",
        "Construction Management", "Earthquake Engineering", "Bridge Engineering",
        "Water Resources Engineering", "Foundation Engineering", "Urban Planning"
    ],
    "Electronics": [
        "Digital Signal Processing", "VLSI Design", "Embedded Systems", "Communication Systems",
        "Microelectronics", "Antenna Theory", "Wireless Communication", "Optical Communication",
        "Semiconductor Devices", "RF Circuit Design", "Radar Systems", "Satellite Communication"
    ],
    "Information Technology": [
        "Data Mining", "Information Security", "Computer Vision", "Internet of Things",
        "Software Testing", "Web Technologies", "Network Security", "Data Warehousing",
        "Enterprise Resource Planning", "Business Intelligence", "IT Infrastructure Management"
    ],
    "Chemical Engineering": [
        "Chemical Process Principles", "Chemical Reaction Engineering", "Process Dynamics and Control",
        "Transport Phenomena", "Biochemical Engineering", "Polymer Technology", "Petroleum Refining",
        "Process Equipment Design", "Industrial Pollution Control", "Nanotechnology"
    ],
    "Biotechnology": [
        "Genetic Engineering", "Immunology", "Bioprocess Engineering", "Molecular Biology",
        "Enzyme Technology", "Bioinformatics", "Tissue Engineering", "Pharmaceutical Biotechnology",
        "Environmental Biotechnology", "Plant Biotechnology", "Animal Biotechnology"
    ],
    "Aerospace Engineering": [
        "Aerodynamics", "Aircraft Structures", "Propulsion Systems", "Flight Mechanics",
        "Avionics", "Space Dynamics", "Rocket Engineering", "Composite Materials",
        "Aircraft Design", "Satellite Systems", "Computational Fluid Dynamics"
    ],
    "Metallurgical Engineering": [
        "Physical Metallurgy", "Extractive Metallurgy", "Material Characterization",
        "Mechanical Behavior of Materials", "Corrosion Engineering", "Foundry Technology",
        "Heat Treatment", "Non-Destructive Testing", "Powder Metallurgy", "Surface Engineering"
    ]
}

# Publishers
publishers = [
    "Pearson Education", "McGraw Hill Education", "Wiley India", "Cengage Learning",
    "Oxford University Press", "Cambridge University Press", "Springer", "Elsevier",
    "PHI Learning", "Khanna Publishers", "Technical Publications", "S. Chand Publishing",
    "Tata McGraw Hill", "Laxmi Publications", "New Age International", "Universities Press",
    "Dhanpat Rai Publications", "BPB Publications", "Arihant Publications", "Ane Books"
]

# Create books
def create_books(count=200):
    print(f"Creating {count} BTech books...")
    books = []
    book_ids = []
    
    for i in range(1, count + 1):
        # Select random category and subject
        category = random.choice(btech_categories)
        subject = random.choice(btech_subjects[category])
        
        # Generate book details
        book_id = i
        title = f"{subject} - {random.choice(['Fundamentals', 'Principles', 'Handbook', 'Guide', 'Concepts', 'Applications', 'Theory', 'Practice'])}"
        
        # Generate author names (Indian authors)
        author_first = random.choice(indian_first_names)
        author_last = random.choice(indian_last_names)
        author = f"Dr. {author_first} {author_last}"
        
        # Generate other book details
        publisher = random.choice(publishers)
        publication_year = random.randint(2010, 2023)
        edition = random.randint(1, 6)
        isbn = f"978-{random.randint(1000000000, 9999999999)}"
        price = random.randint(300, 1500)
        
        # Create book stock (1-10 copies of each book)
        quantity = random.randint(1, 10)
        
        # Store book details
        book = {
            "book_id": book_id,
            "title": title,
            "author": author,
            "category": category,
            "subject": subject,
            "publisher": publisher,
            "publication_year": publication_year,
            "edition": edition,
            "isbn": isbn,
            "price": price,
            "quantity": quantity
        }
        books.append(book)
        book_ids.append(book_id)
        
        # Save to BookStock model
        book_stock = BookStock(
            book_id=book_id,
            quantity=quantity
        )
        book_stock.save()
    
    # Save books to a JSON file for reference
    with open('books_data.json', 'w') as f:
        json.dump(books, f, indent=4)
    
    print(f"Created {len(books)} books successfully.")
    return books, book_ids

# Issue books to members
def issue_books_to_members(members, books, book_ids):
    print("Issuing books to members...")
    issued_count = 0
    
    # Current date for reference
    current_date = datetime.now().date()
    
    for member in members:
        # Decide how many books to issue to this member (0-3)
        num_books_to_issue = random.randint(0, 3)
        
        if num_books_to_issue > 0:
            # Select random books to issue
            selected_book_ids = random.sample(book_ids, min(num_books_to_issue, len(book_ids)))
            
            for book_id in selected_book_ids:
                # Find the book details
                book = next((b for b in books if b["book_id"] == book_id), None)
                
                if book:
                    # Random issue date in the past (1-60 days ago)
                    days_ago = random.randint(1, 60)
                    issue_date = current_date - timedelta(days=days_ago)
                    
                    # Return date (typically 14 days after issue)
                    return_date = issue_date + timedelta(days=14)
                    
                    # Calculate overdue days if applicable
                    overdue_days = 0
                    if return_date < current_date:
                        overdue_days = (current_date - return_date).days
                    
                    # Calculate fine (₹10 per day overdue)
                    fine = overdue_days * 10
                    
                    # Determine status
                    status = "Issued"
                    if random.random() < 0.2:  # 20% chance of being returned
                        status = "Returned"
                        fine = 0
                        overdue_days = 0
                    
                    # Create issued book record
                    issued_book = IssuedBooks(
                        book_id=book_id,
                        book_title=book["title"],
                        book_author=book["author"],
                        issued_to_member=member,
                        issue_date=issue_date,
                        return_date=return_date,
                        overdue=overdue_days,
                        fine=fine,
                        status=status
                    )
                    issued_book.save()
                    issued_count += 1
                    
                    # Update member's books_issued count
                    if status == "Issued":
                        member.books_issued += 1
                        
                        # Add fine to outstanding debt
                        if fine > 0:
                            member.outstanding_debt += fine
            
            # Save member changes
            member.save()
    
    print(f"Issued {issued_count} books successfully.")

# Main function to run all operations
@transaction.atomic
def populate_database():
    try:
        # Clear existing data
        clear_existing_data()
        
        # Create new data
        members = create_members(30)
        books, book_ids = create_books(200)
        issue_books_to_members(members, books, book_ids)
        
        print("Database populated successfully!")
        return True
    except Exception as e:
        print(f"Error populating database: {e}")
        return False

if __name__ == "__main__":
    populate_database()