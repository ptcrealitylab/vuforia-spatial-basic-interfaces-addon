/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const server = require('../../../../libraries/hardwareInterfaces');
const MozillaWotInterface = require('./MozillaWotInterface.js');

let settings = server.loadHardwareInterface(__dirname);

exports.enabled = settings('enabled');
exports.configurable = true; // can be turned on/off/adjusted from the web frontend
exports.settings = {};

if (exports.enabled) {
    server.enableDeveloperUI(true);

    /**
     * runs once, adds and clears the IO points
     */
    async function setup() { // eslint-disable-line no-inner-declarations
        let wotInterface = new MozillaWotInterface();
        exports.settings = wotInterface.exportedSettings;

        try {
            await wotInterface.pair();
            await wotInterface.discoverThings();
        } catch(e) {
            console.error('MozillaWotInterface error', e);
        }
    }

    setup();
}

