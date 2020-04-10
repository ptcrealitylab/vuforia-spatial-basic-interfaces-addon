/**
 * @preserve
 *
 *                                     .,,,;;,'''..
 *                                 .'','...     ..',,,.
 *                               .,,,,,,',,',;;:;,.  .,l,
 *                              .,',.     ...     ,;,   :l.
 *                             ':;.    .'.:do;;.    .c   ol;'.
 *      ';;'                   ;.;    ', .dkl';,    .c   :; .'.',::,,'''.
 *     ',,;;;,.                ; .,'     .'''.    .'.   .d;''.''''.
 *    .oxddl;::,,.             ',  .'''.   .... .'.   ,:;..
 *     .'cOX0OOkdoc.            .,'.   .. .....     'lc.
 *    .:;,,::co0XOko'              ....''..'.'''''''.
 *    .dxk0KKdc:cdOXKl............. .. ..,c....
 *     .',lxOOxl:'':xkl,',......'....    ,'.
 *          .';:oo:...                        .
 *               .cd,    ╔═╗┌─┐┬─┐┬  ┬┌─┐┬─┐   .
 *                 .l;   ╚═╗├┤ ├┬┘└┐┌┘├┤ ├┬┘   '
 *                   'l. ╚═╝└─┘┴└─ └┘ └─┘┴└─  '.
 *                    .o.                   ...
 *                     .''''','.;:''.........
 *                          .'  .l
 *                         .:.   l'
 *                        .:.    .l.
 *                       .x:      :k;,.
 *                       cxlc;    cdc,,;;.
 *                      'l :..   .c  ,
 *                      o.
 *                     .,
 *
 *             ╦ ╦┬ ┬┌┐ ┬─┐┬┌┬┐  ╔═╗┌┐  ┬┌─┐┌─┐┌┬┐┌─┐
 *             ╠═╣└┬┘├┴┐├┬┘│ ││  ║ ║├┴┐ │├┤ │   │ └─┐
 *             ╩ ╩ ┴ └─┘┴└─┴─┴┘  ╚═╝└─┘└┘└─┘└─┘ ┴ └─┘
 *
 * Created by Valentin on 10/22/14.
 * Modified by Carsten on 12/06/15.
 *
 * Copyright (c) 2015 Valentin Heun
 *
 * All ascii characters above must be included in any redistribution.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Set to true to enable the hardware interface
 **/
var server = require('@libraries/hardwareInterfaces');
var settings = server.loadHardwareInterface(__dirname);

exports.enabled = settings('enabled');
exports.configurable = true;

if (exports.enabled) {

    exports.settings = {

    };
    var names = {};
    var portIdentifier = {};
    var namesLego = {};
    var Hub = require('wedoboostpoweredup');
    //  var wedo = new Wedo("lego");

    var hub = new Hub();
    
        /* server.addAppReadListener (function (msg,arg){
             console.log(msg,arg);
         });
         */

        /* server.addAppReadListener (function (msg,arg){
             console.log(msg,arg);
         });
         */
    var HUB_NAME = "";
    if (settings('hubName')) {
        HUB_NAME = settings('hubName');
    } else {
        HUB_NAME = "legoHub";
    }

    const TOOL_NAME = "IO";
    
        server.enableDeveloperUI(true);

        var namecount = 1;

        /* hub.on('ble', function (msg) {
             setTimeout(function() {
                 server.sendToUI("wedoBLE",msg);
             }, 500);
     
     
         });
         */


        hub.on('connected', function (uuid) {
            
            // todo If both wedos have the same name, give numbers
            // todo make nodes invisible on command

            
            if (hub.wedoBoostPoweredUp[uuid]) {
                if(hub.wedoBoostPoweredUp[uuid].deviceType === "wedo") {
                    names[uuid] = {0x01: "port 1", 0x02: "port 2"};
                    portIdentifier[uuid] = {0x01: "1", 0x02: "2"};
                }
                else {
                    names[uuid] = {0x00: "port A", 0x01: "port B", 0x02: "port C", 0x03: "port D", 0x3A: "port E"};
                    portIdentifier[uuid] = {0x00: "A", 0x01: "B", 0x02: "C", 0x03: "D", 0x3A: "E"};
                }

                if (!(uuid in namesLego)) {
                    namesLego[uuid] = HUB_NAME+"_" + namecount;
                    namecount++;
                    // names[uuid].name = hub.wedoBoostPoweredUp[uuid].name;
                }
                names[uuid].name = namesLego[uuid];
                hub.wedoBoostPoweredUp[uuid].name = names[uuid].name;

                //  server.sendToUI("wedoOn",names[uuid].name);


                if (hub.wedoBoostPoweredUp[uuid].name) {
                    console.log("wedo connected", hub.wedoBoostPoweredUp[uuid].name);
                    var thisHub = hub.wedoBoostPoweredUp[uuid].name;
                    console.log("Adding nodes for++++++++++++++++++ ", hub.wedoBoostPoweredUp[uuid].name);
                    
                    if(hub.wedoBoostPoweredUp[uuid].deviceType === "wedo") {

                        server.addNode(thisHub, TOOL_NAME, "port "+portIdentifier[uuid][0x01], "node");
                        // server.addNode(thisHub, "none 1", "node");

                        server.addNode(thisHub, TOOL_NAME, "port "+portIdentifier[uuid][0x02], "node");
                        // server.addNode(thisHub, "none 2", "node");

                        server.addNode(thisHub, TOOL_NAME, "button", "node");

                        server.addNode(thisHub, TOOL_NAME, "light", "node");

                       // server.renameNode(names[uuid].name, TOOL_NAME, names[uuid][0x01], names[uuid][0x01]);
                        // server.renameNode(names[uuid].name, "none 1", "y1");
                       // server.renameNode(names[uuid].name, TOOL_NAME, names[uuid][0x01], names[uuid][0x01]);
                        // server.renameNode(names[uuid].name, "none 2", "y2");

                    } else {
                        server.addNode(thisHub, TOOL_NAME, "port "+portIdentifier[uuid][0x00], "node");
                        server.addNode(thisHub, TOOL_NAME, "port "+portIdentifier[uuid][0x01], "node");
                        server.addNode(thisHub, TOOL_NAME, "port "+portIdentifier[uuid][0x02], "node");
                        server.addNode(thisHub, TOOL_NAME, "port "+portIdentifier[uuid][0x03], "node");
                        server.addNode(thisHub, TOOL_NAME, "port "+portIdentifier[uuid][0x3A], "node");
                        server.addNode(thisHub, TOOL_NAME, "button", "node");
                        server.addNode(thisHub, TOOL_NAME, "light", "node");
                    }
                    
                    server.activate(thisHub);

                    for (let key in portIdentifier[uuid]){
                        server.addReadListener(names[uuid].name, TOOL_NAME, "port "+portIdentifier[uuid][key], function (key, portIdentifier, names, wedo, uuid, data) {
                            // console.log(names[uuid].name,data);
                            if (names[uuid][key] === "motor"+ " "+portIdentifier[uuid][key]) {
                                hub.setMotor(server.map(data.value, -1, 1, -100, 100), 1, uuid);
                            }
                        }.bind(this, key, portIdentifier, names, hub, uuid));
                    }
                    
                    server.addReadListener(names[uuid].name, TOOL_NAME, "light", function (names, hub, uuid, data) {
                        var color = parseInt(data.value * 255);
                        hub.setLedColor(color, color, color, uuid);
                    }.bind(this, names, hub, uuid));
                    
                    hub.on('button', function (button, uuid) {
                        if (uuid in names) {
                            server.write(names[uuid].name, TOOL_NAME, "button", button, "f");
                        }

                    }.bind(this));

                }
            }
        }.bind(this));


        hub.on('disconnected', function (uuid) {
            // remove all listeners when disconnected

            if (names[uuid].name) {

                // server.sendToUI("wedoOff",names[uuid].name);
                server.deactivate(names[uuid].name);

                for (let key in portIdentifier[uuid]){

                    server.renameNode(names[uuid].name, TOOL_NAME, "port "+portIdentifier[uuid][key], " ");
                    names[uuid][key] ="port "+portIdentifier[uuid][key];

                    resetNode(uuid, key);
                }
                
                server.removeReadListeners(names[uuid].name, TOOL_NAME);

            }

        });

    hub.on('motor', function (distance, port, uuid) {
        if (uuid in names) {
            server.write(names[uuid].name, TOOL_NAME, "port " + portIdentifier[uuid][port], server.map(10 - distance, 0, 10, 0, 1), "f");
        }
    });
        

        hub.on('distanceSensor', function (distance, port, uuid) {
            if (uuid in names) {
                server.write(names[uuid].name, TOOL_NAME, "port " + portIdentifier[uuid][port], server.map(10 - distance, 0, 10, 0, 1), "f");
            }
        });

    hub.on('motor', function (motorRotation, port, uuid) {
        server.writePublicData(names[uuid].name, TOOL_NAME, "port " + portIdentifier[uuid][port], 'motorRotation', motorRotation);
    });


    hub.on('visionSensor', function (colorLuminance, port, uuid) {
        server.write(names[uuid].name, TOOL_NAME, "port " + portIdentifier[uuid][port], server.map((colorLuminance.r+colorLuminance.g+colorLuminance.b)/3,0,255,0,1), "f");
        server.writePublicData(names[uuid].name, TOOL_NAME, "port " + portIdentifier[uuid][port], 'colorLuminance', colorLuminance);
    });
        

        hub.on('tiltSensor', function (x, y, port, uuid) {
            if (uuid in names) {
                Math.round(20.49);
                server.write(names[uuid].name, TOOL_NAME, "port " + portIdentifier[uuid][port], Math.round(server.map(x, -45, 45, 0, 1) * 100) / 100, "f");
                server.writePublicData(names[uuid].name, TOOL_NAME, "port " + portIdentifier[uuid][port], 'tilt', {x:x, y:y});
            }
        });


        hub.on('port', function (port, connected, type, uuid) {
console.log("'####################################", port, connected, type,)
            if (hub.wedoBoostPoweredUp[uuid]) {
                names[uuid] = names[uuid] || {};

                var x = "port", y = " ";

                if (type === "distanceSensor") {
                    x = "distance";
                } else
                if (type === "motor") {
                    x = "motor";
                } else
                if (type === "tiltSensor") {
                    x = "motion";
                    //    y = "y";
                } else
                if (type === "visionSensor") {
                    x = "vision";
                    //    y = "y";
                }

                var thisHub = hub.wedoBoostPoweredUp[uuid].name;

                if (connected) {
                    server.renameNode(thisHub, TOOL_NAME, "port " + portIdentifier[uuid][port], x);
                    server.write(names[uuid].name, TOOL_NAME, "port " + portIdentifier[uuid][port], 0, "f");
                    names[uuid][port] = x + " " + portIdentifier[uuid][port];
                } 
                if(!connected){
                    server.renameNode(thisHub, TOOL_NAME, "port " + portIdentifier[uuid][port], "port " + portIdentifier[uuid][port]);
                    names[uuid][port] = "port " + portIdentifier[uuid][port];
                    // server.renameNode(thisHub, "none 1", " ");
                    // names[uuid].py1 = "none 1";
                    resetNode(uuid, port); 
                    
                }
            }
        });

    function resetNode (uuid, port){
        server.write(names[uuid].name, TOOL_NAME, "port "+port, 0, "f");
        //  server.write(names[uuid].name, "none "+port, 0, "f");

    }
}



