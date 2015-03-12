# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion
from django.conf import settings
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('contenttypes', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='ActivityCollection',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(unique=True, max_length=100)),
                ('nickname', models.CharField(max_length=100)),
                ('description', models.TextField(null=True, blank=True)),
                ('accesscode', models.CharField(null=True, validators=[django.core.validators.MinLengthValidator(10)], max_length=255, blank=True, unique=True, verbose_name=b'Access Code')),
                ('is_active', models.BooleanField(default=True)),
                ('is_public', models.BooleanField(default=False)),
                ('is_deleted', models.BooleanField(default=False)),
            ],
            options={
                'permissions': (('view_course', 'view course'), ('edit_course', 'edit course')),
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('file_upload', models.FileField(null=True, upload_to=b'documents', blank=True)),
                ('created', models.DateTimeField(auto_now_add=True, null=True)),
                ('object_id', models.PositiveIntegerField(null=True, blank=True)),
                ('accessURL', models.URLField(null=True, blank=True)),
                ('content_type', models.ForeignKey(blank=True, to='contenttypes.ContentType', null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Lesson',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('display_order', models.IntegerField(default=0)),
                ('collection', models.ForeignKey(on_delete=django.db.models.deletion.SET_NULL, blank=True, to='core.ActivityCollection', null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField()),
                ('created', models.DateTimeField(auto_now_add=True, null=True)),
                ('audio_URL', models.URLField(null=True, blank=True)),
                ('creator', models.ForeignKey(to=settings.AUTH_USER_MODEL)),
                ('parent_post', models.ForeignKey(blank=True, to='core.Post', null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
