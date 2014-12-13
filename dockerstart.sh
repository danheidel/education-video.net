sudo ln -s /usr/bin/nodejs /usr/bin/node

cd /tmp

rm -rf education-video.net; true

git clone https://github.com/danheidel/education-video.net.git

cd education-video.net

npm install

bower install --allow-root

node -v

ls -la

node app.js
