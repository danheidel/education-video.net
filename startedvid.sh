#!/bin/sh

docker rm -f edvid

docker run -P -d -p 80:5000 --name edvid --link mongo:mongo danheidel/edvid
