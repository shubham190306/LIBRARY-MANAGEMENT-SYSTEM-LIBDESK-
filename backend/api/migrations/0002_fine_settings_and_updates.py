# Generated migration for FineSettings model and IssuedBooks updates

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        # Create FineSettings model
        migrations.CreateModel(
            name='FineSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fine_per_day', models.IntegerField(default=20, help_text='Fine amount per day for overdue books')),
                ('rent_cost_per_day', models.IntegerField(default=10, help_text='Rental cost per day')),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Fine Settings',
            },
        ),
        # Update IssuedBooks.book_id from IntegerField to CharField
        migrations.AlterField(
            model_name='issuedbooks',
            name='book_id',
            field=models.CharField(max_length=50),
        ),
        # Update IssuedBooks.status to use choices
        migrations.AlterField(
            model_name='issuedbooks',
            name='status',
            field=models.CharField(
                choices=[('Issued', 'Issued'), ('Returned', 'Returned'), ('Overdue', 'Overdue')],
                default='Issued',
                max_length=50
            ),
        ),
        # Update Members.member_phone from IntegerField to CharField
        migrations.AlterField(
            model_name='members',
            name='member_phone',
            field=models.CharField(max_length=15),
        ),
    ]
