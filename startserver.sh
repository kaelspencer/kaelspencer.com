#!/bin/bash

. ../virtualenv/kaelspencer.com/bin/activate

exec python manage.py runfcgi protocol=fcgi host=127.0.0.1 port=8000 daemonize=false
