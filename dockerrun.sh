#!/bin/sh

docker rm -f mongo

docker rm -f edvid

docker run -P -d --name mongo -v /var/www/mongodata:/data/db -p 27017:27017 danheidel/mongo

docker run -P -d -p 80:5000 --name edvid --link mongo:mongo danheidel/edvid
