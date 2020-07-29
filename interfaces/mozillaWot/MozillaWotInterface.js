const fetch = require('node-fetch');
const WebSocket = require('ws');

const server = require('../../../../libraries/hardwareInterfaces');

module.exports = class MozillaWotInterface {
    constructor() {
        this.interfaceName = 'mozillaWot';
        this.settings = server.loadHardwareInterface(__dirname);
        this.exportedSettings = {
            status: {
                type: 'status',
                connection: 'SPECIFY GATEWAY URL',
                things: {},
            },
            gatewayUrl: {
                value: this.settings('gatewayUrl'),
                type: 'text',
                default: '',
                helpText: 'The url of the Mozilla WoT Gateway you want to connect to.',
            },
            token: {
                value: this.settings('token'),
                type: 'text',
                default: '',
                helpText: 'The token to authenticate with the Gateway.',
            },
        };
    }

    async pair() {
        if (this.settings('gatewayUrl')) {
            this.gatewayUrl = this.settings('gatewayUrl');
        } else {
            const gatewayUrl = await this.discoverLocalGatewayUrl();
            this.exportedSettings.status.connection = 'RETRIEVE A TOKEN IDK';
            this.gatewayUrl = gatewayUrl;
            this.exportedSettings.gatewayUrl.value = this.gatewayUrl;
            await this.persistSettings();
        }

        if (this.settings('token')) {
            this.token = this.settings('token');
        } else {
            exports.settings.status.connection = 'PLEASE TOKEN PLEASE';
        }

    }

    async persistSettings() {
        return new Promise((res, rej) => {
            server.setHardwareInterfaceSettings(
                this.interfaceName,
                this.exportedSettings,
                null,
                function(successful, error) {
                    if (error) {
                        console.error('Error persisting settings', error);
                        rej(error);
                        return;
                    }
                    res();
                }
            );
        });
    }

    async discoverLocalGatewayUrl() {
        // TODO support automatically discovering gateway.local
    }

    async discoverThings() {
        const res = await fetch(`${this.gatewayUrl}/things`, {headers: this.getHeaders()});
        const things = await res.json();
        if (!things || !things.length) {
            console.warn('No things found');
            return;
        }
        for (let thing of things) {
            let thingId = thing.id.split('/').pop();
            let frameId = thingId + 'frame';
            for (let propertyId in thing.properties) {
                server.addNode(thingId, frameId, propertyId, 'node');
            }
            server.activate(thingId);
            for (let propertyId in thing.properties) {
                let property = thing.properties[propertyId];
                let propertyLink;
                if (property.links && property.links.length > 0) {
                    propertyLink = property.links[0].href;
                } else {
                    propertyLink = '/' + thing.id + '/properties/' + propertyId;
                }
                server.addReadListener(
                    thingId, frameId, propertyId,
                    this.onRead(`${this.gatewayUrl}${propertyLink}`, propertyId, property.type === 'boolean'));
            }
        }
    }

    getHeaders() {
        return {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
        };
    }

    /**
     * Create an onRead listener
     * @param {string} propertyLink
     * @param {string} propertyId
     * @param {boolean} isBoolean
     * @return {function}
     */
    onRead(propertyLink, propertyId, isBoolean) {
        return async data => {
            try {
                let body = JSON.stringify({
                    [propertyId]: isBoolean ? data.value > 0.5 : data.value,
                });

                const res = await fetch(propertyLink, {
                    headers: this.getHeaders(),
                    method: 'PUT',
                    body,
                });
                await res.json();
            } catch (e) {
                console.error('Unable to write data to WoT gateway', data, e);
            }
        };
    }

    /**
     * Add WebSocket listeners for thing with id thingId
     * TODO: Use this to allow bidirectional communication
     * @param {WebSocket} ws
     * @param {string} thingId
     */
    async addListeners(ws, thingId) {
        ws.addEventListener('message', function(event) {
            let msg = JSON.parse(event.data);
            if (msg.messageType === 'propertyStatus') {
                for (let propId in msg.data) {
                    let _value = msg.data[propId];
                }
            }
        });

        function reopen() {
            let newWs = new WebSocket(ws.url);
            this.addListeners(newWs, thingId);
        }

        ws.addEventListener('close', function() {
            console.warn(`Reopening WebSocket for ${thingId} (close)`);
            reopen();
        });

        ws.addEventListener('error', function() {
            console.warn(`Reopening WebSocket for ${thingId} (error)`);
            reopen();
        });
    }
};
