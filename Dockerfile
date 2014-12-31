# Dockerizing MongoDB: Dockerfile for education-video.net

FROM       nodesource/node:trusty
#maintained node environment: https://nodesource.com/blog/nodesource-docker-images
MAINTAINER danheidel <dan.heidel@gmail.com>

# Installation:

# Update apt-get sources
RUN apt-get update && apt-get install -y git git-core && npm install -g npm@latest && npm install -g bower

COPY . /tmp/edvid
WORKDIR /tmp/edvid

RUN npm install && bower install --allow-root

# Expose port 5000 from the container to the host
EXPOSE 5000

# run application
CMD node app.js

