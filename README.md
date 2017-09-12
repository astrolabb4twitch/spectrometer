# LED Spectrometer

The Led spectrometer is an open-source project. The aim is to dectect molecules in liquid. This project is based on raspberry Pi commanded by an 5'' display screen. The Raspberry controls by an node.js server and his module : Johnny-five an arduino mega to control LED, servo and photoresistor. The datas are displayed in real-time on the screen.

# Getting Started

	## Prerequisites

		### hardware
* Raspberry Pi 3
* Arduino Mega
* 5'' HDMI display screen 
* servomotor
* breadboard (adafruit perma-proto for me)
* LED (wave-length adapted for your search)

		### installing
* up-to-date raspbian
* VNC servor : X11vnc
   sudo apt-get update
   sudo apt-get install x11vnc
   x11vnc -storepasswd
* 5'' display screen
	* `/boot/config.txt` 
    device_tree=bcm2710-rpi-3-b.dtb 
    dtoverlay=ads7846,penirq=22,speed=10000,penirq_pull=2,xohms=150
    dtparam=spi=on
    hdmi_group=2
    hdmi_mode=1
    hdmi_mode=87
    hdmi_cvt 800 480 60 6 0 0 0
	* touch screen settings
    sudo apt-get install autoconf libx11-dev libxext-dev libxi-dev x11proto-input-dev
    cd ~
    wget http://github.com/downloads/tias/xinput_calibrator/xinput_calibrator-0.7.5.tar.gz
    tar -zxvf xinput_calibrator-0.7.5.tar.gz
    cd xinput_calibrator-0.7.5
    ./configure
    make
    sudo make install
    DISPLAY=:0.0  xinput_calibrator
write values in `/etc/X11/xorg.conf.d/99-calibration.conf`
* install node.js    
		* check version of node on your Pi : `node -v`
		* check Pi caracteristcs : `uname -a` 
		* you need the 4.2.1 for johnny-five
    wget https://nodejs.org/dist/v4.2.1/node-v4.2.1-linux-armv7l.tar.xz
    tar -xvf node-v4.2.1-linux-armv7l.tar.xz
    cd node-v4.2.1-linux-armv7l
    sudo cp -R * /usr/local/
* install arduino IDE
    sudo apt-get install arduino
    arduino
* install nodejs modules
    sudo npm install johnny-five
    sudo npm install express
    sudo npm install ejs
    sudo npm install socket.io
* install firmware on arduinoMega : in IDE Arduino 

npm install -g forever

* Install forever-service : to start node.js on each boot on spectrometer.js 

npm install -g forever-service

sudo forever-service install spectrometer --script /home/pi/Desktop/spectrometer.js

sudo service spectrometer start

* copy files and folder on Desktop : you must change on spectrometer.js file : photoresistor pin line 41, servomotor pin line 47

* reboot

	
	# ***Running the tests***

* the screen on boot shows spectrometer home page. The servor uses Chromium in kiosk mode. You may connect with a browser to the IP raspberry : http://how.do.you.troll.biz/ 
* Learn french language and push on `Lancer le programme `
* you must set up :
	* LED color
	* angular measurement of servomotor : it's the angular value where the LED is in front of the cuvette.
	* LED pin on the mega
* push on `lancer l'analyse`
* after page reboot, the values are showed at the bottom on the graphic.
 
