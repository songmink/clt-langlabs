# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('overdub_discussions', '0002_auto_20150630_2008'),
    ]

    operations = [
        migrations.AlterField(
            model_name='overdubactivity',
            name='media',
            field=models.CharField(default=b'', help_text=b'Video or audio URL (e.g. http://youtu.be/DJ9zIuFoQ5o)', max_length=400),
        ),
    ]
