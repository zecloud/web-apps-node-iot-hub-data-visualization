const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const iotHubClient = require('./IoThub/iot-hub.js');

const iotHubConnectionString = process.env['IotHubConnectionString'];
const iotHubConsumerGroup = process.env['EventHubConsumerGroup'];

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => {
    res.redirect('/');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            try {
                console.log('sending data ' + data);
                client.send(data);
            } catch (e) {
                console.error(e);
            }
        }
    });
};

server.listen(process.env.PORT || '3000', () => {
    console.log('Listening on %d', server.address().port);
});

const iotHubReader = new iotHubClient(iotHubConnectionString, iotHubConsumerGroup);

(async () => {
    const foo = await iotHubReader.startReadMessage((obj, date) => {
        try {
            const dateString = new Date(date || Date.now()).toISOString();
            console.log(dateString);

            wss.broadcast(JSON.stringify({
                ...obj,
                time: dateString
            }));
        } catch (err) {
            console.log(obj);
            console.error(err);
        }
    });

    const bar = foo;
})().catch();
