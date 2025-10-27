import requests
import random
from datetime import datetime, timedelta
import json

# API endpoint
API_URL = "http://127.0.0.1:8000/books/"

# B.Tech book titles and authors
btech_books = [
    {"title": "Introduction to Algorithms", "author": "Thomas H. Cormen"},
    {"title": "Computer Networks", "author": "Andrew S. Tanenbaum"},
    {"title": "Database System Concepts", "author": "Abraham Silberschatz"},
    {"title": "Operating System Concepts", "author": "Abraham Silberschatz"},
    {"title": "Artificial Intelligence: A Modern Approach", "author": "Stuart Russell"},
    {"title": "Computer Organization and Design", "author": "David A. Patterson"},
    {"title": "Digital Design", "author": "M. Morris Mano"},
    {"title": "Software Engineering", "author": "Ian Sommerville"},
    {"title": "Data Structures and Algorithms", "author": "Alfred V. Aho"},
    {"title": "Computer Graphics: Principles and Practice", "author": "James D. Foley"},
    {"title": "Discrete Mathematics and Its Applications", "author": "Kenneth H. Rosen"},
    {"title": "Introduction to the Theory of Computation", "author": "Michael Sipser"},
    {"title": "Computer Architecture", "author": "John L. Hennessy"},
    {"title": "Compilers: Principles, Techniques, and Tools", "author": "Alfred V. Aho"},
    {"title": "Machine Learning", "author": "Tom M. Mitchell"},
    {"title": "Pattern Recognition and Machine Learning", "author": "Christopher M. Bishop"},
    {"title": "Deep Learning", "author": "Ian Goodfellow"},
    {"title": "Reinforcement Learning", "author": "Richard S. Sutton"},
    {"title": "Natural Language Processing", "author": "Daniel Jurafsky"},
    {"title": "Computer Vision: Algorithms and Applications", "author": "Richard Szeliski"},
    {"title": "Cryptography and Network Security", "author": "William Stallings"},
    {"title": "Information Theory, Inference and Learning Algorithms", "author": "David J.C. MacKay"},
    {"title": "The Art of Computer Programming", "author": "Donald E. Knuth"},
    {"title": "Introduction to Information Retrieval", "author": "Christopher D. Manning"},
    {"title": "Numerical Methods for Engineers", "author": "Steven C. Chapra"},
    {"title": "Engineering Mathematics", "author": "K.A. Stroud"},
    {"title": "Signals and Systems", "author": "Alan V. Oppenheim"},
    {"title": "Digital Signal Processing", "author": "John G. Proakis"},
    {"title": "Control Systems Engineering", "author": "Norman S. Nise"},
    {"title": "Electric Circuits", "author": "James W. Nilsson"},
]

# Generate 300 B.Tech books
print("Adding 300 B.Tech books...")
success_count = 0

# First, try to delete existing books
try:
    delete_response = requests.delete("http://127.0.0.1:8000/books/")
    print("Attempted to delete existing books")
except:
    print("Could not delete existing books, continuing with adding new ones")

# Generate variations of the base books to reach 300
for i in range(300):
    base_book = btech_books[i % len(btech_books)]
    
    # Create variations for volume numbers, editions, or specialized topics
    if i < len(btech_books):
        title = base_book["title"]
        author = base_book["author"]
    else:
        variation = i // len(btech_books)
        title = f"{base_book['title']} - Volume {variation}" if variation <= 3 else f"{base_book['title']} - {['Advanced', 'Practical', 'Modern', 'Essential', 'Fundamental'][variation % 5]} Edition"
        author = base_book["author"]
    
    # Generate random publication date within last 10 years
    days_back = random.randint(0, 3650)  # Up to 10 years back
    pub_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
    
    # Create book with B.Tech category
    book_data = {
        "bookID": random.randint(10000, 99999),
        "title": title,
        "authors": author,
        "average_rating": round(random.uniform(3.0, 5.0), 1),
        "isbn": f"978-{random.randint(1000000000, 9999999999)}",
        "isbn13": f"978-{random.randint(1000000000, 9999999999)}",
        "language_code": "eng",
        "num_pages": random.randint(200, 800),
        "ratings_count": random.randint(50, 5000),
        "text_reviews_count": random.randint(10, 500),
        "publication_date": pub_date,
        "publisher": "B.Tech Publications",
        "status": "Available"
    }
    
    try:
        # Add book via API
        response = requests.post(API_URL, json=book_data)
        if response.status_code in [200, 201]:
            success_count += 1
            print(f"Added book {i+1}/300: {title}")
        else:
            print(f"Failed to add book {title}: {response.status_code}")
    except Exception as e:
        print(f"Error adding book {title}: {str(e)}")

print(f"Successfully added {success_count} B.Tech books to the database!")