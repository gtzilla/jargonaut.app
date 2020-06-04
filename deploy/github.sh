#!/bin/bash

git stash
git checkout -b gh-pages
mv node_modules node-static
git add node-static
git commit -m "Deploying to Github SPA"
git push origin -f gh-pages
git checkout -b master
