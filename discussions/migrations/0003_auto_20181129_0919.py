# Generated by Django 2.1.3 on 2018-11-29 19:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('discussions', '0002_auto_20161206_1547'),
    ]

    operations = [
        migrations.AlterField(
            model_name='discussionactivity',
            name='activity_type',
            field=models.CharField(choices=[('discussion', 'Discussion Activity'), ('essay', 'Essay Activity'), ('overdub', 'Overdub Media Activity'), ('flatpage', 'Flatpage Activity')], default='discussion', max_length=100),
        ),
        migrations.AlterField(
            model_name='discussionactivity',
            name='is_deleted',
            field=models.BooleanField(blank=True, default=False),
        ),
        migrations.AlterField(
            model_name='discussionactivity',
            name='lesson',
            field=models.ManyToManyField(blank=True, to='core.Lesson'),
        ),
        migrations.AlterField(
            model_name='discussionactivity',
            name='posts',
            field=models.ManyToManyField(blank=True, to='core.Post'),
        ),
    ]
