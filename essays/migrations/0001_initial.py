# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion
from django.conf import settings
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='EssayActivity',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=100)),
                ('instructions', models.TextField()),
                ('display_order', models.IntegerField(default=0)),
                ('created', models.DateTimeField(auto_now_add=True, null=True)),
                ('modified', models.DateTimeField(auto_now=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('activity_type', models.CharField(default=b'discussion', max_length=100, choices=[(b'discussion', b'Discussion Activity'), (b'essay', b'Essay Activity'), (b'overdub', b'Overdub Media Activity')])),
                ('permission_control', models.BooleanField(default=False)),
                ('is_deleted', models.BooleanField(default=False)),
                ('required_revisions', models.IntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(50)])),
                ('collection', models.ForeignKey(related_name='essays', on_delete=django.db.models.deletion.SET_NULL, blank=True, to='core.ActivityCollection', null=True)),
                ('lesson', models.ManyToManyField(to='core.Lesson', null=True, blank=True)),
                ('posts', models.ManyToManyField(to='core.Post', null=True, blank=True)),
            ],
            options={
                'abstract': False,
                'permissions': (('view_activity', 'view activity'),),
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='EssayResponse',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('draft_title', models.CharField(default=b'default_draft_title', max_length=200)),
                ('draft_number', models.IntegerField(default=1)),
                ('status', models.CharField(default=b'in progress', max_length=100)),
                ('modified', models.DateTimeField(auto_now=True, null=True)),
                ('draft', models.TextField(null=True, blank=True)),
                ('review', models.TextField(null=True, blank=True)),
                ('flagged', models.BooleanField(default=False)),
                ('essay_activity', models.ForeignKey(to='essays.EssayActivity')),
                ('posts', models.ManyToManyField(to='core.Post', null=True, blank=True)),
                ('reviewed_by', models.ForeignKey(related_name='reviewed_essay_drafts', blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('user', models.ForeignKey(related_name='authored_essay_drafts', blank=True, to=settings.AUTH_USER_MODEL, null=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
