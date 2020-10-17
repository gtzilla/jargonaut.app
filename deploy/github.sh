#!/bin/bash

echo 'Stashing any uncommited changes.'
git stash
git branch -D gh-pages 
git checkout -b gh-pages
# mv node_modules node-static
echo 'Starting deploy. Setup file structure'
rm -rf node-static
mkdir -p node-static
yarn install --prod --no-bin-links
echo 'Adding Vendor libraries'
mv node_modules/react node-static
mv node_modules/react-dom node-static
mv node_modules/underscore node-static
mv node_modules/web-router.js node-static
mv node_modules/moment node-static
echo 'Done adding Vendor libraries'
# github is using the README.md as an index.html. 
# copy the index.html => 404.html to be full Github SPA
cp index.html 404.html
git add .
git commit -m "Deploying to Github SPA"
git push origin -f gh-pages
git checkout master
echo 'cleaning'
rm -rf 404.html
rm -rf node-static
yarn install
git branch -D gh-pages
