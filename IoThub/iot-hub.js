//
// IoT Gateway BLE Script - Microsoft Sample Code - Copyright (c) 2016 - Licensed MIT
//

const { EventHubClient, EventPosition } = require('azure-event-hubs');

class IoTHubReaderClient {
    constructor(connectionString, consumerGroupName) {
        this.connectionString = connectionString;
        this.consumerGroupName = consumerGroupName;
        this.iotHubClient = undefined;
    }

    async startReadMessage(startReadMessageCallback) {
        const deviceId = process.env['DeviceId'];

        try {
            const client = await EventHubClient.createFromIotHubConnectionString(this.connectionString);
            this.iotHubClient = client;

            const ids = await this.iotHubClient.getPartitionIds();

            console.log("The partition ids are: ", ids);

            const onError = (err) => {
                console.error(err.message || err);
            };

            const onMessage = (message) => {
                const from = message.annotations['iothub-connection-device-id'];
                if (deviceId && deviceId !== from) {
                    return;
                }

                return startReadMessageCallback(message.body, Date.parse(message.enqueuedTimeUtc));
            };

            return ids.map((id) => {
                return this.iotHubClient.receive(id, onMessage, onError, {
                    eventPosition: EventPosition.fromEnqueuedTime(Date.now())
                });
            });
        }
        catch (ex) {
            console.error(error.message || error)
        }
    }

    async stopReadMessage() {
        await this.iotHubClient.close();
    }
}

module.exports = IoTHubReaderClient;
