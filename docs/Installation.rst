Installation
============

Creating Virtual Environment
----------------------------

Let's setup our seperate python environment first by installing *virtualenv* and *virtualenv wrapper*::

$ sudo pip install virtualenv

Then follow the instructions from http://virtualenvwrapper.readthedocs.org/en/latest/::

$ pip install virtualenvwrapper

After creating your virtual environment, then activate the virtual environment by::

$workon (YourEnv)

From now on, we assume all the following actions are performed in that virtual environment.

Installing Dependencies
-----------------------

Before installing anything, change current working directory to the root *"clt-langlabs-dev-py/"*, then::

$ pip install -r requirements/base.txt

If you want to edit the documentation later, you can add extra dependencies like *Sphinx*, they are included in *dev.txt*, so instead type::

$ pip install -r requirements/dev.txt

Configure Settings
------------------

Inside the directory *~/cltlanglab/settings/* is the settings file for our project, in *base.py* we need to configure settings for **recorder** used in our project, you can get a license from http://recorder.denniehoopingarner.com/

The file *save.php* and related directories also have to be created in your server first. These configuration info need to be put into *cltlanglab/settings/base.py* :: 

	# Server side setup for recorder
	recorder_myServer="http://192.168.1.8/";  # Address of server for video recording files
	recorder_myHandler="phpinc/save.php";     # save.php handles the file saving of recorded files
	recorder_myDirectory="uploads";           # "phpinc/uploads/" is directory for all recording files

**Database** configuration need to be put into *cltlanglab/settings/dev.py* ::

	DATABASES = {
	    'default': {
	        'ENGINE': 'django.db.backends.postgresql_psycopg2',
	        'NAME': 'cltlangdb',
	        'USER': 'djangodbuser',
	        'PASSWORD': '1',
	        'HOST': 'localhost',
	        'PORT': '5432',
	    }
	}

Run Development Server
----------------------


Two server need to be run using **screen**::
	
	# This is to start a new screen session
	$ screen -s
    # This is the chat server that run on localhost:8001 
	$ python cltlanglab/chat_server.py
	# Then press ctrl+a+d to detach from current screen

And the django development server::

	# This is to start a new screen session
	$ screen -s
	# python development server run on localhost:8000
	$ python manage.py runserver localhost:8000 --settings=cltlanglab.settings.dev
	# Then press ctrl+a+d to detach from current screen

The web app can be visited through http://localhost:8000

To get back to any one of the two screen above::

	# This is to list all screen sessions
	$ screen -ls
	# To session with session name or number
	$ screen -r <name>






