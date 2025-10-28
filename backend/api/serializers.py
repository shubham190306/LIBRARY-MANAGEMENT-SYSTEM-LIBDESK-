from rest_framework import serializers
from .models import *

class MembersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Members
        fields = '__all__'
        read_only_fields = ['joining_date']

class IssuedBooksSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssuedBooks
        fields = '__all__'
        read_only_fields = ['issue_date']

class BookStockSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookStock
        fields = '__all__'
