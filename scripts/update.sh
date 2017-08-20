#!/bin/bash

service wikusbrink.com stop || true
cd /home/ubuntu/wikusbrink.com
git pull
cd /home/ubuntu/wikusbrink.com/src
npm install
service wikusbrink.com start
