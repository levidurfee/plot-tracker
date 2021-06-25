#!/usr/bin/bash
ARCH=`uname -i`
wget https://github.com/levidurfee/plot-tracker/releases/download/v1.0.0-dev-rc3/linux-amd64-v1.0.0-dev-rc3.tar.gz
tar -xf linux-amd64-v1.0.0-dev-rc3.tar.gz

# check if config already exists, if it doesn't, copy it

# move binary
sudo mv pt /usr/local/bin/plottracker

# copy service file
