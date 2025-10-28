# Admin configuration for library management system
# Add this to your admin.py file to register models in Django admin

from django.contrib import admin
from .models import Members, IssuedBooks, BookStock, FineSettings


@admin.register(Members)
class MembersAdmin(admin.ModelAdmin):
    list_display = ('member_id', 'member_name', 'member_email', 'is_active', 'books_issued', 'outstanding_debt')
    list_filter = ('is_active', 'joining_date')
    search_fields = ('member_name', 'member_email')
    readonly_fields = ('joining_date',)


@admin.register(IssuedBooks)
class IssuedBooksAdmin(admin.ModelAdmin):
    list_display = ('book_id', 'book_title', 'issued_to_member', 'status', 'issue_date', 'return_date', 'fine')
    list_filter = ('status', 'issue_date')
    search_fields = ('book_title', 'book_author')
    readonly_fields = ('issue_date',)


@admin.register(BookStock)
class BookStockAdmin(admin.ModelAdmin):
    list_display = ('book_id', 'quantity')
    search_fields = ('book_id',)


@admin.register(FineSettings)
class FineSettingsAdmin(admin.ModelAdmin):
    list_display = ('fine_per_day', 'rent_cost_per_day', 'updated_at')
    
    def has_delete_permission(self, request):
        # Prevent deletion of fine settings
        return False
    
    def has_add_permission(self, request):
        # Only allow one FineSettings object
        return not FineSettings.objects.exists()
