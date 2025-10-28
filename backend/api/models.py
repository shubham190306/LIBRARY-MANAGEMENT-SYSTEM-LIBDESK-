from django.db import models
from .constants import BOOK_STATUS_CHOICES

class FineSettings(models.Model):
    """Configuration for fine rates"""
    fine_per_day = models.IntegerField(default=20, help_text="Fine amount per day for overdue books")
    rent_cost_per_day = models.IntegerField(default=10, help_text="Rental cost per day")
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Fine Settings"
    
    def __str__(self):
        return f"Fine: {self.fine_per_day}/day, Rent: {self.rent_cost_per_day}/day"

class Members(models.Model):
    member_id = models.AutoField(primary_key=True)
    member_name = models.CharField(max_length=50)
    member_email = models.EmailField()
    member_phone = models.CharField(max_length=15)
    joining_date = models.DateField(auto_now_add=True)
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    outstanding_debt = models.IntegerField(default=0)
    books_issued = models.PositiveIntegerField(default=0)
    last_settlement_date = models.DateField(blank=True, null=True)
    last_settled_amount = models.IntegerField(default=0)

class IssuedBooks(models.Model):
    book_id = models.CharField(max_length=50)  # Support both string and numeric IDs
    book_title = models.CharField(max_length=255)
    book_author = models.CharField(max_length=255)
    issued_to_member = models.ForeignKey(Members, on_delete=models.CASCADE)
    issue_date = models.DateField(auto_now=True)
    return_date = models.DateField()
    overdue = models.IntegerField(default=0)
    fine = models.IntegerField(default=0)
    status = models.CharField(max_length=50, choices=BOOK_STATUS_CHOICES, default='Issued')


class BookStock(models.Model):
    book_id = models.IntegerField()
    quantity = models.PositiveIntegerField(default=0)