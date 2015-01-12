#!/bin/sh

docker rm -f mongo

docker run -P -d --name mongo -v /var/www/mongodata:/data/db -p 27017:27017 danheidel/mongo
