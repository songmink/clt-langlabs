# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_langlabuserprofile'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='activitycollection',
            options={'permissions': (('view_course', 'view course'), ('edit_course', 'edit course'), ('create_course', 'create course'))},
        ),
    ]
