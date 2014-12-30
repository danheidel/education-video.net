echo alias node
sudo ln -s /usr/bin/nodejs /usr/bin/node

echo cd temp
cd /tmp

echo clear data
rm -rf education-video.net; true

echo clone git repo
git clone https://github.com/danheidel/education-video.net.git

echo go into repo
cd education-video.net

echo npn install
npm install

echo bower install --allow-root
bower install --allow-root

echo node version
node -v

echo ls
ls -la

echo start app
node app.js
