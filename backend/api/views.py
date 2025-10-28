from django.shortcuts import render
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
import requests
from rest_framework import status
from .models import *
from .serializers import *
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .constants import *
import urllib.parse
import logging
import json
import os

logger = logging.getLogger(__name__)

class BooksListAPI(APIView):
    permission_classes = [AllowAny]  # Books are publicly viewable
    
    def get(self, request):
        count = int(request.GET.get('count', 20))
        page = int(request.GET.get('page', 1))
        title = request.GET.get('title')
        authors = request.GET.get('authors')
        
        # Try to load BTech books from local JSON file first
        try:
            import json
            import os
            
            # Get the path to books_data.json
            json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'books_data.json')
            
            if os.path.exists(json_path):
                with open(json_path, 'r') as f:
                    btech_books = json.load(f)
                
                # Filter by title or author if provided
                filtered_books = btech_books
                if title or authors:
                    filtered_books = []
                    for book in btech_books:
                        title_match = title and title.lower() in book['title'].lower()
                        author_match = authors and 'author' in book and authors.lower() in book['author'].lower()
                        if title_match or author_match:
                            filtered_books.append(book)
                    btech_books = filtered_books
                
                # Format books for frontend
                formatted_books = []
                for book in btech_books:
                    book_id = book.get('book_id')
                    formatted_book = {
                        'bookID': book_id,
                        'title': book.get('title'),
                        'authors': book.get('author'),
                        'average_rating': DEFAULT_BOOK_RATING,
                        'publisher': book.get('publisher'),
                        'publication_date': str(book.get('publication_year')),
                        'isbn': book.get('isbn'),
                        'isbn13': book.get('isbn'),
                        'language_code': DEFAULT_LANGUAGE_CODE,
                        'num_pages': DEFAULT_BOOK_PAGES,
                        'ratings_count': DEFAULT_RATINGS_COUNT,
                        'text_reviews_count': DEFAULT_REVIEWS_COUNT,
                    }
                    
                    # Check if book is issued
                    if IssuedBooks.objects.filter(book_id=book_id, status="Issued").exists():
                        formatted_book['status'] = "Issued"
                    else:
                        formatted_book['status'] = "Available"
                    
                    formatted_books.append(formatted_book)
                
                # Paginate results
                start_idx = (page - 1) * count
                end_idx = start_idx + count
                paginated_books = formatted_books[start_idx:end_idx]
                
                return Response(paginated_books, status=status.HTTP_200_OK)
        except (json.JSONDecodeError, IOError, KeyError) as e:
            logger.warning(f"Error loading BTech books: {str(e)}")
            # If local books fail, fall back to external API
        
        # Fallback to external API
        url = FRAPPE_API_URL
        books = []
        max_pages = MAX_API_PAGES

        while len(books) < count and page <= max_pages:
            params = {'page': page}
            if title:
                params.update({"title": title})
            if authors:
                params["authors"] = authors
            try:
                frappe_response = requests.get(url, params=params)
                response_data = frappe_response.json()

                if frappe_response.status_code == 200:
                    fetched_books = response_data.get('message', [])
                    for book in fetched_books:
                        book_id = book.get('bookID')
                        if IssuedBooks.objects.filter(book_id=book_id, status="Issued").exists():
                            book['status'] = "Issued"
                        else:
                            book['status'] = "Available"
                        books.append(book)
                    if not fetched_books:
                        break  # Exit if no more books are returned
                    page += 1
                else:
                    logger.error(f"Failed to fetch books from Frappe API: {frappe_response.status_code}")
                    return Response({'error': 'Failed to fetch data'}, status=status.HTTP_400_BAD_REQUEST)
            except requests.RequestException as e:
                logger.error(f"Request error while fetching books: {str(e)}")
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                logger.error(f"Unexpected error while fetching books: {str(e)}")
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(books[:count], status=status.HTTP_200_OK)
        
    def delete(self, request):
        """Delete all books from BookStock model and books_data.json"""
        if not request.user.is_authenticated or not request.user.is_staff:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        try:
            # Delete all BookStock entries
            BookStock.objects.all().delete()
            
            # Clear the books_data.json file
            json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'books_data.json')
            
            if os.path.exists(json_path):
                try:
                    with open(json_path, 'w') as f:
                        json.dump([], f)
                except IOError as file_error:
                    logger.warning(f"Could not clear books_data.json: {str(file_error)}")
            
            return Response({"message": "All books deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error deleting books: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MembersAPI(APIView):
    permission_classes = [AllowAny]  # Members list is publicly viewable
    
    def get(self, request):
        count = request.GET.get('count')

        try:
            count = int(count)  # Ensure count is an integer
        except (TypeError, ValueError):
            count = None

        members = Members.objects.all()

        if count:
            members = members[:count]

        serialized_members = MembersSerializer(members, many=True)
        return Response(serialized_members.data, status=status.HTTP_200_OK)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = MembersSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, member_id=None):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            if member_id:
                # Delete specific member
                member = Members.objects.get(member_id=member_id)
                member.delete()
                return Response({"message": f"Member {member_id} deleted successfully"}, status=status.HTTP_200_OK)
            else:
                # If no member_id provided in URL, check if it's in the request data
                member_id = request.data.get('member_id')
                if member_id:
                    member = Members.objects.get(member_id=member_id)
                    member.delete()
                    return Response({"message": f"Member {member_id} deleted successfully"}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Member ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        except Members.DoesNotExist:
            logger.warning(f"Member with ID {member_id} not found")
            return Response({"error": f"Member with ID {member_id} not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error deleting member {member_id}: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MembersPageAPI(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Get page and page_size from request parameters
        page_number = request.GET.get('page', 1)
        page_size = request.GET.get('count', 20)  # Default page size is 20

        try:
            page_number = int(page_number)
            page_size = int(page_size)
        except (TypeError, ValueError):
            page_number = 1
            page_size = 20

        # Fetch all members
        members = Members.objects.all()

        # Apply pagination
        paginator = Paginator(members, page_size)
        try:
            page = paginator.page(page_number)
        except (EmptyPage, PageNotAnInteger) as e:
            logger.warning(f"Invalid page request: page={page_number}, size={page_size}")
            return Response([], status=status.HTTP_404_NOT_FOUND)

        serialized_members = MembersSerializer(page.object_list, many=True)

        # Return paginated data
        return Response({
            'total_pages': paginator.num_pages,
            'current_page': page_number,
            'total_members': paginator.count,
            'members': serialized_members.data
        }, status=status.HTTP_200_OK)


class IssuedBooksListAPI(APIView):
    permission_classes = [AllowAny]  # Issued books list is viewable
    
    def get(self, request):
        count = request.GET.get('count')

        issued_books = IssuedBooks.objects.filter(status = "Issued")

        if count:
            count = int(count)
            issued_books = issued_books[:count]

        serialized_issued_books = IssuedBooksSerializer(issued_books, many=True)
        return Response(serialized_issued_books.data, status=status.HTTP_200_OK)


class IssuedBooksAPI(APIView):
    permission_classes = [AllowAny]  # Viewing issued book details is public
    
    def get(self, request):
        book_id = request.GET.get('book_id')

        if not book_id:
            return Response({'message': 'Book Id is requried'})

        issued_book = IssuedBooks.objects.filter(book_id = book_id, status="Issued").first()

        if not issued_book:
            return Response({'message': 'Book not issued yet'}, status=status.HTTP_404_NOT_FOUND)

        serializer_issued_book = IssuedBooksSerializer(issued_book)
        return Response(serializer_issued_book.data, status=status.HTTP_200_OK)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        data = request.data
        serializer = IssuedBooksSerializer(data = data, partial = True)

        if serializer.is_valid():
            issued_book = serializer.save()

            # Increase the books_issued count for the member
            member = issued_book.issued_to_member
            member.books_issued += 1
            member.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        book_id = request.data.get('book_id')
        issued_book = IssuedBooks.objects.filter(book_id=book_id, status=BOOK_STATUS_ISSUED).first()

        today = timezone.now().date()
        
        if not issued_book:
            logger.warning(f"Issued book not found for book_id: {book_id}")
            return Response({'error' : 'Issued book not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Get fine settings
            fine_settings = FineSettings.objects.first()
            rent_per_day = fine_settings.rent_cost_per_day if fine_settings else RENT_COST_PER_DAY

            member = issued_book.issued_to_member
            member.books_issued -= 1
            rent_days = (today - issued_book.issue_date).days
            if issued_book.issue_date == today:
                rent_days = 1

            member.outstanding_debt += (rent_days * rent_per_day)
            member.save()
            issued_book.status = BOOK_STATUS_RETURNED
            issued_book.save()
            return Response({'message' : 'Issued Book returned successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error returning book {book_id}: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OverDueBookList(APIView):
    permission_classes = [AllowAny]  # Overdue list is viewable
    
    def get(self, request):
        try:
            count = int(request.GET.get('count', DEFAULT_PAGE_SIZE))
        except (ValueError, TypeError):
            count = DEFAULT_PAGE_SIZE
        
        today = timezone.now().date()
        
        try:
            # Get fine settings
            fine_settings = FineSettings.objects.first()
            fine_per_day = fine_settings.fine_per_day if fine_settings else FINE_PER_DAY
            
            overdue_books = IssuedBooks.objects.filter(return_date__lt=today, status=BOOK_STATUS_ISSUED)
            result = []

            for overdue_book in overdue_books:
                overdue_days = (today - overdue_book.return_date).days
                overdue_book.fine = (overdue_days * fine_per_day)
                overdue_book.overdue = overdue_days
                overdue_book.save()
                
                result.append({
                    'member_id': overdue_book.issued_to_member.member_id,
                    'member_name': overdue_book.issued_to_member.member_name,
                    'book_id': overdue_book.book_id,
                    'book_title': overdue_book.book_title,
                    'book_author': overdue_book.book_author,
                    'overdue': overdue_book.overdue,
                    'fine': overdue_book.fine
                })
            
            return Response(result[:count], status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching overdue books: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

class SettleMemberDebtAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        member_id = request.GET.get('member_id')

        member = Members.objects.filter(member_id = member_id).first()

        if not member:
            return Response({"message" : "Invalid Member ID"}, status=status.HTTP_400_BAD_REQUEST)
        
        
        member.last_settlement_date = timezone.now().date()
        member.last_settled_amount = member.outstanding_debt
        member.outstanding_debt = 0
        member.save()

        return Response({"message" : "Outstanding Settled"}, status=status.HTTP_200_OK)
    

class SettleDuesAPI(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, member_id):
        try:
            member = Members.objects.get(member_id=member_id)
            member.last_settlement_date = timezone.now().date()
            member.last_settled_amount = member.outstanding_debt
            member.outstanding_debt = 0
            member.save()
            return Response({"message": "Outstanding Debt Settled"}, status=status.HTTP_200_OK)
        except Members.DoesNotExist:
            return Response({"message": "Member not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class StatisticsAPI(APIView):
    permission_classes = [AllowAny]  # Statistics are publicly viewable
    
    def get(self, request):
        try:
            total_members = Members.objects.count()
            active_members = Members.objects.filter(is_active=True).count()
            issued_books = IssuedBooks.objects.filter(status=BOOK_STATUS_ISSUED).count()
            returned_books = IssuedBooks.objects.filter(status=BOOK_STATUS_RETURNED).count()
            
            # Get total books from BookStock
            total_books = BookStock.objects.count()
            
            # Get total books from books_data.json
            total_btech_books = 0
            try:
                json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'books_data.json')
                
                if os.path.exists(json_path):
                    with open(json_path, 'r') as f:
                        btech_books = json.load(f)
                    total_btech_books = len(btech_books)
            except (IOError, json.JSONDecodeError) as e:
                logger.warning(f"Error loading books_data.json: {str(e)}")
                total_btech_books = 0

            data = {
                "total_members": total_members,
                "active_members": active_members,
                "issued_books": issued_books,
                "returned_books": returned_books,
                "total_books": total_books,
                "total_btech_books": total_btech_books
            }
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching statistics: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
