# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_post_is_deleted'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activitycollection',
            name='accesscode',
            field=models.CharField(max_length=255, unique=True, null=True, verbose_name=b'Access Code', validators=[django.core.validators.MinLengthValidator(10)]),
            preserve_default=True,
        ),
    ]
