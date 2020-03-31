/**
 * Created by Carsten on 12/06/15.
 * Modified by Peter Som de Cerff (PCS) on 12/21/15
 *
 * Copyright (c) 2015 Carsten Strunk
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 *  PHILIPS HUE CONNECTOR
 *
 * This hardware interface can communicate with philips Hue lights. The config.json file specifies the connection information
 * for the lamps in your setup. A light in this config file has the following attributes:
 * {
 * 'host':'localhost',                  // ip or hostname of the philips Hue bridge
 * 'url':'/api/newdeveloper/lights/1',  // base path of the light on the bridge, replace newdeveloper with a valid username (see http://www.developers.meethue.com/documentation/getting-started)
 * 'id':'Light1',                       // the name of the RealityInterface
 * 'port':'80'                          // port the hue bridge is listening on (80 on all bridges by default)
 *
 * }
 *
 * Some helpful resources on the Philips Hue API:
 * http://www.developers.meethue.com/documentation/getting-started
 * http://www.developers.meethue.com/documentation/lights-api
 *
 * TODO: Add some more functionality, i.e. change color or whatever the philips Hue API offers
 */
//Enable this hardware interface
var server = require('@libraries/hardwareInterfaces');

var settings = server.loadHardwareInterface(__dirname);

exports.enabled = settings('enabled');
exports.configurable = true; // can be turned on/off/adjusted from the web frontend

if (exports.enabled) {
    var fs = require('fs');
    var http = require('http');
    var _ = require('lodash');
    server.enableDeveloperUI(true);



    var lights = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));

    /**
     * runs once, adds and clears the IO points
     */
    function setup() {
        //load the config file
        //lights = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));

        console.log('setup philipsHue');
        for (var key in lights) {
            lights[key].switch = undefined;
            lights[key].bri = undefined;
            if (lights[key].colorful) {
                lights[key].hue = undefined;
                lights[key].sat = undefined;
            }
        }
    }


    /**
     * Communicates with the philipsHue bridge and checks the state of the light
     * @param {Object} light the light to check
     * @param {function} callback function to run when the response has arrived
     **/
    function getLightState(light, callback) {
        var state;

        var options = {
            host: light.host,
            path: light.url,
            port: light.port,
            method: 'GET',
        };

        var callbackHttp = function (response) {
            var str = '';

            response.on('data', function (chunk) {
                str += chunk;
            });

            response.on('end', function () {
                //TODO add some error handling
                state = JSON.parse(str).state;
                if (!state) {
                    console.error('Philips Hue Error', str);
                    return;
                }
                const frameId = light.id + 'frame';
                if (state.on != light.switch) {
                    light.switch = state.on;
                    if (state.on) {
                        callback(light.id, frameId, 'switch', 1, 'd');
                    } else {
                        callback(light.id, frameId, 'switch', 0, 'd');
                    }

                }

                if (state.bri != light.bri) {
                    light.bri = state.bri; // brightness is a value between 1 and 254
                    callback(light.id, frameId, 'brightness', (state.bri - 1) / 253, 'f');
                }

                if (light.colorful) {
                    if (state.hue != light.hue) {
                        light.hue = state.hue; // hue is a value between 0 and 65535
                        callback(light.id, frameId, 'hue', state.hue / 65535, 'f'); // map hue to [0,1]
                    }

                    if (state.sat != light.sat) {
                        light.sat = state.sat;
                        callback(light.id, frameId, 'saturation', state.sat / 254, 'f');
                    }
                }

            });
        };

        var req = http.request(options, callbackHttp);
        req.on('error', function (e) {
            console.log('GetLightState HTTP error', e.message);
        });
        req.end();
    }


    /**
     * turns the specified light on or off
     * @param {number} state turns the light on if > 0.5, turns it off otherwise
     */
    function writeSwitchState(light, state) {
        var options = {
            host: light.host,
            path: light.url + '/state',
            port: light.port,
            method: 'PUT',
        };


        var req = http.request(options, function () { });
        req.on('error', function (e) {
            console.log('writeSwitchState HTTP error', e.message);
        });

        req.write(JSON.stringify({
            on: state > 0.5
        }));

        req.end();

        //TODO check for success message from the bridge
    }


    /**
         * @desc writeBrightness() Sets the brightness of the specified light
         * @param {number} bri is the brightness in the range [0,1]
     **/

    function writeBrightness(light, bri) {
        if (writeBrightness.requestInFlight) {
            return;
        }

        var options = {
            hostname: light.host,
            path: light.url + '/state',
            port: light.port,
            method: 'PUT',
        };

        writeBrightness.requestInFlight = true;
        var req = http.request(options, function() {
            setTimeout(function() {
                writeBrightness.requestInFlight = false;
            }, 100);
        });
        req.on('error', function (e) {
            console.log('writeBrightness HTTP error', e.message);
            setTimeout(function() {
                writeBrightness.requestInFlight = false;
            }, 100);
        });

        req.write(JSON.stringify({
            bri: Math.floor(bri * 253 + 1)
        }));

        req.end();
    }


    /**
     * sets the saturation for the specified light
     * @param {number} sat is the saturation in the range [0,1]
     */
    function writeSaturation(light, sat) {
        var options = {
            hostname: light.host,
            path: light.url + '/state',
            port: light.port,
            method: 'PUT',
        };

        var req = http.request(options, function () { });
        req.on('error', function (e) {
            console.log('writeSaturation HTTP error', e.message);
        });
        req.write(JSON.stringify({
            sat: Math.floor(sat * 254),
        }));
        req.end();
    }


    /**
     * sets the hue for the specified light
     * @param {number} hue is the hue in the range [0,1]
     */
    function writeHue(light, hue) {
        var options = {
            hostname: light.host,
            path: light.url + '/state',
            port: light.port,
            method: 'PUT',
        };

        var req = http.request(options, function () { });
        req.on('error', function (e) {
            console.log('writeHue HTTP error', e.message);
        });
        req.write(JSON.stringify({
            hue: Math.floor(hue * 65535),
        }));
        req.end();
    }

    /**
     * The main function, runs the setup and then periodically checks whether
     * the lights are on.
     */
    function philipsHueServer() {
        console.log('philipsHue starting philipsHue');
        setup();


        // TODO poll more often in production environment
        for (var key in lights) {
            setInterval(function (light) {
                getLightState(light, server.write);
            }, 700 + _.random(-100, 100), lights[key]);
        }
    }

    /**
     * @param {string} lightId
     * @param {Function} writeFn
     * @return {Function} read listener callback that invokes writeFn
     */
    function onRead(lightId, writeFn) {
        return function(data) {
            writeFn(lights[lightId], data.value);
        };
    }

    // Set up server-side frames, nodes, and listeners for all known lights
    for (var lightId in lights) {
        const frameId = lightId + 'frame';
        server.addNode(lightId, frameId, 'switch', 'node');
        server.addNode(lightId, frameId, 'brightness', 'node');
        if (lights[lightId].colorful) {
            server.addNode(lightId, frameId, 'hue', 'node');
            server.addNode(lightId, frameId, 'saturation', 'node');
        }
        server.activate(lightId);

        server.addReadListener(lightId, frameId, 'switch', onRead(lightId, writeSwitchState));
        server.addReadListener(lightId, frameId, 'brightness', onRead(lightId, writeBrightness));

        if (lights[lightId].colorful) {
            server.addReadListener(lightId, frameId, 'hue', onRead(lightId, writeHue));
            server.addReadListener(lightId, frameId, 'saturation', onRead(lightId, writeSaturation));
        }
    }

    philipsHueServer();
}



