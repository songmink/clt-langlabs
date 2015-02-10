# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('essays', '0002_auto_20150209_1607'),
    ]

    operations = [
        migrations.AlterField(
            model_name='essayactivity',
            name='required_revisions',
            field=models.IntegerField(validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(50)]),
            preserve_default=True,
        ),
    ]
