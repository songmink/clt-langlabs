command = 'gunicorn'
pythonpath = '/pythonweb/myproject'
bind = '127.0.0.1:8001'
workers = 2
# run with  :   gunicorn -c gunicorn_config.py myproject.wsgi
# to run forever:    press ctrl+z    type bg  and 'enter'
# to exit : type fg,   press ctrl+c  
