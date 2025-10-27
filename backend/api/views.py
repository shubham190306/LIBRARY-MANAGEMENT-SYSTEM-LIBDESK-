from django.shortcuts import render
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from rest_framework import status
from .models import *
from .serializers import *
from django.core.paginator import Paginator
import urllib.parse

class BooksListAPI(APIView):
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
                if title:
                    btech_books = [book for book in btech_books if title.lower() in book['title'].lower()]
                if authors:
                    btech_books = [book for book in btech_books if 'author' in book and authors.lower() in book['author'].lower()]
                
                # Format books for frontend
                formatted_books = []
                for book in btech_books:
                    book_id = book.get('book_id')
                    formatted_book = {
                        'bookID': book_id,
                        'title': book.get('title'),
                        'authors': book.get('author'),
                        'average_rating': 4.5,  # Default rating
                        'publisher': book.get('publisher'),
                        'publication_date': str(book.get('publication_year')),
                        'isbn': book.get('isbn'),
                        'isbn13': book.get('isbn'),
                        'language_code': 'eng',
                        'num_pages': 300,  # Default pages
                        'ratings_count': 100,  # Default ratings
                        'text_reviews_count': 20,  # Default reviews
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
        except Exception as e:
            print(f"Error loading BTech books: {str(e)}")
            # If local books fail, fall back to external API
        
        # Fallback to external API
        url = "https://frappe.io/api/method/frappe-library"
        books = []
        max_pages = 10  # Limit to prevent infinite loops

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
                    return Response({'error': 'Failed to fetch data'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(books[:count], status=status.HTTP_200_OK)
        
    def delete(self, request):
        """Delete all books from BookStock model and books_data.json"""
        try:
            # Delete all BookStock entries
            BookStock.objects.all().delete()
            
            # Clear the books_data.json file
            import os
            import json
            json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'books_data.json')
            
            if os.path.exists(json_path):
                with open(json_path, 'w') as f:
                    json.dump([], f)
            
            return Response({"message": "All books deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MembersAPI(APIView):
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
        serializer = MembersSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, member_id=None):
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
            return Response({"error": f"Member with ID {member_id} not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MembersPageAPI(APIView):
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
        except EmptyPage:
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
    def get(self, request):
        count = request.GET.get('count')

        issued_books = IssuedBooks.objects.filter(status = "Issued")

        if count:
            count = int(count)
            issued_books = issued_books[:count]

        serialized_issued_books = IsssuedBooksSerializer(issued_books, many=True)
        return Response(serialized_issued_books.data, status=status.HTTP_200_OK)


class IssuedBooksAPI(APIView):
    def get(self, request):
        book_id = request.GET.get('book_id')

        if not book_id:
            return Response({'message': 'Book Id is requried'})

        issued_book = IssuedBooks.objects.filter(book_id = book_id, status="Issued").first()

        if not issued_book:
            return Response({'message': 'Book not issued yet'}, status=status.HTTP_404_NOT_FOUND)

        serializer_issued_book = IsssuedBooksSerializer(issued_book)
        return Response(serializer_issued_book.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        serializer = IsssuedBooksSerializer(data = data, partial = True)

        if serializer.is_valid():
            issued_book = serializer.save()

            # Increase the books_issued count for the member
            member = issued_book.issued_to_member
            member.books_issued += 1
            member.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        book_id = request.data.get('book_id')
        issued_book = IssuedBooks.objects.filter(book_id=book_id, status = "Issued").first()

        today = timezone.now().date()
        
        if not issued_book:
            return Response({'error' : 'Issued book not found'}, status=status.HTTP_404_NOT_FOUND)

        member = issued_book.issued_to_member
        member.books_issued -= 1
        rent_days = (today - issued_book.issue_date).days
        if issued_book.issue_date==today:
            rent_days = 1

        member.outstanding_debt += (rent_days*10)
        member.save()
        issued_book.status = 'Returned'
        issued_book.save()
        return Response({'message' : 'Issued Book returned successfully'}, status=status.HTTP_200_OK)


class OverDueBookList(APIView):
    def get(self, request):
        count = int(request.GET.get('count',20))
        today = timezone.now().date()

        overdue_books = IssuedBooks.objects.filter(return_date__lt = today, status = "Issued")

        result = []

        for overdue_book in overdue_books:
            overdue_days = (today - overdue_book.return_date).days
            overdue_book.fine = (overdue_days * 20)
            overdue_book.overdue = overdue_days

            overdue_book.save()
            result.append({
                'member_id' : overdue_book.issued_to_member.member_id,
                'member_name' : overdue_book.issued_to_member.member_name,
                'book_id': overdue_book.book_id,
                'book_title': overdue_book.book_title,
                'book_author': overdue_book.book_author,
                'overdue': overdue_book.overdue,
                'fine': overdue_book.fine
            })
        
        return Response(result[:count], status=status.HTTP_200_OK)
    

class SettleMemberDebtAPI(APIView):
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
    def get(self, request):
        total_members = Members.objects.count()
        active_members = Members.objects.filter(is_active = True).count()
        issued_books = IssuedBooks.objects.filter(status = "Issued").count()
        returned_books = IssuedBooks.objects.filter(status = "Returned").count()
        
        # Get total books from BookStock
        total_books = BookStock.objects.count()
        
        # Get total books from books_data.json
        try:
            import json
            import os
            
            json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'books_data.json')
            
            if os.path.exists(json_path):
                with open(json_path, 'r') as f:
                    btech_books = json.load(f)
                total_btech_books = len(btech_books)
            else:
                total_btech_books = 0
        except:
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