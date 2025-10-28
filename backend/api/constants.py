# Fine and Fee Configuration
FINE_PER_DAY = 20  # Fine amount in currency units per day for overdue books
RENT_COST_PER_DAY = 10  # Rental cost per day for books

# Default Book Values
DEFAULT_BOOK_RATING = 4.5
DEFAULT_BOOK_PAGES = 300
DEFAULT_RATINGS_COUNT = 100
DEFAULT_REVIEWS_COUNT = 20
DEFAULT_LANGUAGE_CODE = 'eng'

# Pagination
DEFAULT_PAGE_SIZE = 20
MAX_API_PAGES = 10

# External API Configuration
FRAPPE_API_URL = "https://frappe.io/api/method/frappe-library"

# Book Status Options
BOOK_STATUS_ISSUED = "Issued"
BOOK_STATUS_RETURNED = "Returned"
BOOK_STATUS_OVERDUE = "Overdue"

BOOK_STATUS_CHOICES = [
    (BOOK_STATUS_ISSUED, "Issued"),
    (BOOK_STATUS_RETURNED, "Returned"),
    (BOOK_STATUS_OVERDUE, "Overdue"),
]
