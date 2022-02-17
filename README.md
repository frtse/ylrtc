# ylrtc
Webrtc SFU.

## Online demo
[Video conference demo.](https://ffrtc.com)

## Features
+ Efficient network performance provided by boost asio.
+ Single-process-multi-threaded architecture, memory pool optimization.
+ Single-port implementation of webrtc connection mapping to thread.
+ ICE-Lite、DTLS、RTP、RTCP.
+ The receiving end processing of Transport-wide Congestion Control.

## Platform
Ubuntu 18.04

## Install dependencies
./install.sh

## Build
mkdir build  
cd build  
cmake ..  
make

## Run
+ Fill in the configuration file correctly.
+ ./ylrtc ../conf/config.toml