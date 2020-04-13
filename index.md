---
layout: doc
title: Basic Interfaces Add-on
permalink: /docs/vuforia-spatial-basic-interfaces-addon
---

## Basic Interfaces

The [Basic Interfaces
add-on](https://github.com/ptcrealitylab/vuforia-spatial-basic-interfaces-addon)
hosts a set of hardware interfaces for DIY and consumer hardware. We hope that
these interfaces will enable you to easily get started creating compelling
experiences with the Vuforia Spatial Toolbox and Vuforia Spatial Edge Server.

## Supported hardware

- [Philips Hue](/docs/vuforia-spatial-basic-interfaces-addon/interfaces/philipsHue)
- Arduino: Documentation coming soon
- LEGO WeDo: Documentation coming soon


## Install
Once you have installed the Vuforia Spatial Edge Server clone this repo into the ```addons``` folder

```bash
cd addons
git clone https://github.com/ptcrealitylab/vuforia-spatial-basic-interfaces-addon.git
```

Next, enter the vuforia-spatial-basic-interfaces-addon directory and install all dependencies.

```bash
cd vuforia-spatial-basic-interfaces-addon
npm install
```

## Prerequisites (for compiling the dependencies)

#### OS X

 * Install [Xcode](https://itunes.apple.com/ca/app/xcode/id497799835?mt=12)
 
 #### Windows

```cmd
npm install --global --production windows-build-tools
```
 
##### Ubuntu, Debian, Raspbian

```sh
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
```
