#!/bin/bash

# Replace these three settings.
PROJDIR=$PWD
PIDFILE="$PROJDIR/www.pid"

cd $PROJDIR
if [ -f $PIDFILE ]; then
    kill `cat -- $PIDFILE`
    rm -f -- $PIDFILE
fi

. ../virtualenv/kaelspencer.com/bin/activate

exec python manage.py runfcgi protocol=fcgi host=127.0.0.1 port=8000 pidfile=$PIDFILE
