# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='DiscussionActivity',
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
                ('read_after_post', models.BooleanField(default=False)),
                ('private_mode', models.BooleanField(default=False)),
                ('collection', models.ForeignKey(related_name='discussions', on_delete=django.db.models.deletion.SET_NULL, blank=True, to='core.ActivityCollection', null=True)),
                ('lesson', models.ManyToManyField(to='core.Lesson', null=True, blank=True)),
                ('posts', models.ManyToManyField(to='core.Post', null=True, blank=True)),
            ],
            options={
                'abstract': False,
                'permissions': (('view_activity', 'view activity'),),
            },
            bases=(models.Model,),
        ),
    ]
