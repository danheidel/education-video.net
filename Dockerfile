# Dockerizing MongoDB: Dockerfile for education-video.net

FROM       ubuntu:14.04
MAINTAINER danheidel <dan.heidel@gmail.com>

# Installation:

# Update apt-get sources
RUN apt-get update && curl -sL https://deb.nodesource.com/setup | sudo bash - && apt-get install -y nodejs npm git git-core && npm install -g bower

RUN cd tmp && git clone https://github.com/danheidel/education-video.net.git && cd education-video.net && npm install && bower install --allow-root

# Expose port 5000 from the container to the host
EXPOSE 5000

#install application
#ADD dockerstart.sh /tmp/
#RUN chmod +x /tmp/dockerstart.sh
#CMD ./tmp/dockerstart.sh

# run application
CMD node app.js

