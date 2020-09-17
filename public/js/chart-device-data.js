/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);

  // A class for holding the last N points of telemetry for a device
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = 500;
      this.timeData = new Array(this.maxLen);
      this.temperatureData = new Array(this.maxLen);
      this.humidityData = new Array(this.maxLen);
      this.tvOCData =new Array(this.maxLen);
      this.CO2Data =new Array(this.maxLen);
      this.VisibleLData  =new Array(this.maxLen);
      this.UVData =new Array(this.maxLen);
      this.IRData =new Array(this.maxLen);
      this.TDSData =new Array(this.maxLen);
      this.WATERLData =new Array(this.maxLen);
      this.WATERTempData =new Array(this.maxLen);
    }

    addData(time, temperature, humidity,tvOC,CO2,VisibleL,IR,UV,TDS,WATERL,WATERTemp) {
      this.timeData.push(time);
      this.temperatureData.push(temperature);
      this.humidityData.push(humidity || null);
      this.tvOCData.push(tvOC|| null);
      this.CO2Data.push(CO2 || null);
      this.VisibleLData.push(VisibleL || null);
      this.UVData.push(UV|| null);
      this.IRData.push(IR || null);
      this.TDSData.push(TDS || null);
      this.WATERLData.push(WATERL || null);
      this.WATERTEMPData.push(WATERTemp || null);
      
      if (this.timeData.length > this.maxLen) {
        this.timeData.shift();
        this.temperatureData.shift();
        this.humidityData.shift();
        this.tvOCData.shift();
        this.CO2Data.shift();
        this.VisibleLData.shift();
        this.UVData.shift();
        this.IRData.shift();
        this.TDSData.shift();
        this.WATERLData.shift();
        this.WATERTEMPData.shift();
      }
    }
  }

  // All the devices in the list (those that have been sending telemetry)
  class TrackedDevices {
    constructor() {
      this.devices = [];
    }

    // Find a device based on its Id
    findDevice(deviceId) {
      for (let i = 0; i < this.devices.length; ++i) {
        if (this.devices[i].deviceId === deviceId) {
          return this.devices[i];
        }
      }

      return undefined;
    }

    getDevicesCount() {
      return this.devices.length;
    }
  }

  const trackedDevices = new TrackedDevices();

  // Define the chart axes
  const chartData = {
    datasets: [
      {
        fill: false,
        label: 'Temperature',
        yAxisID: 'Temperature',
        borderColor: 'rgba(255, 204, 0, 1)',
        pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        spanGaps: true,
      },
      {
        fill: false,
        label: 'Humidity',
        yAxisID: 'Humidity',
        borderColor: 'rgba(24, 120, 240, 1)',
        pointBoarderColor: 'rgba(24, 120, 240, 1)',
        backgroundColor: 'rgba(24, 120, 240, 0.4)',
        pointHoverBackgroundColor: 'rgba(24, 120, 240, 1)',
        pointHoverBorderColor: 'rgba(24, 120, 240, 1)',
        spanGaps: true,
      }
    ]
  };
  const chartGazData = {
    datasets: [
      {
        fill: false,
        label: 'TvOC',
        yAxisID: 'TvOC',
        borderColor: 'rgba(255, 204, 0, 1)',
        pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        spanGaps: true,
      },
      {
        fill: false,
        label: 'CO2',
        yAxisID: 'CO2',
        borderColor: 'rgba(24, 120, 240, 1)',
        pointBoarderColor: 'rgba(24, 120, 240, 1)',
        backgroundColor: 'rgba(24, 120, 240, 0.4)',
        pointHoverBackgroundColor: 'rgba(24, 120, 240, 1)',
        pointHoverBorderColor: 'rgba(24, 120, 240, 1)',
        spanGaps: true,
      }
    ]
  };
    const chartWaterData = {
    datasets: [
      {
        fill: false,
        label: 'TDS',
        yAxisID: 'TDS',
        borderColor: 'rgba(255, 204, 0, 1)',
        pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        spanGaps: true,
      },
      {
        fill: false,
        label: 'WaterTemp',
        yAxisID: 'WATERTEMP',
        borderColor: 'rgba(255, 204, 0, 1)',
        pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        spanGaps: true,
      },
       {
        fill: false,
        label: 'Water Level',
        yAxisID: 'WATERL',
        borderColor: 'rgba(255, 0, 0, 1)',
        pointBoarderColor: 'rgba(255, 0, 0, 1)',
        backgroundColor: 'rgba(255, 0, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 0, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 0, 0, 1)',
        spanGaps: true,
      }
    ]
  };
  const chartLightData = {
    datasets: [
      {
        fill: false,
        label: 'Visible Light',
        yAxisID: 'VisibleL',
        borderColor: 'rgba(255, 204, 0, 1)',
        pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        spanGaps: true,
      },
       {
        fill: false,
        label: 'IR',
        yAxisID: 'IR',
        borderColor: 'rgba(255, 0, 0, 1)',
        pointBoarderColor: 'rgba(255, 0, 0, 1)',
        backgroundColor: 'rgba(255, 0, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 0, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 0, 0, 1)',
        spanGaps: true,
      },
      {
        fill: false,
        label: 'UV',
        yAxisID: 'UV',
        borderColor: 'rgba(24, 120, 240, 1)',
        pointBoarderColor: 'rgba(24, 120, 240, 1)',
        backgroundColor: 'rgba(24, 120, 240, 0.4)',
        pointHoverBackgroundColor: 'rgba(24, 120, 240, 1)',
        pointHoverBorderColor: 'rgba(24, 120, 240, 1)',
        spanGaps: true,
      }
    ]
  };
  const chartOptions = {
    scales: {
      yAxes: [{
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'Temperature (ºC)',
          display: true,
        },
        position: 'left',
      },
      {
        id: 'Humidity',
        type: 'linear',
        scaleLabel: {
          labelString: 'Humidity (%)',
          display: true,
        },
        position: 'right',
      }]
    }
  };

  const chartGazOptions = {
    scales: {
      yAxes: [{
        id: 'TvOC',
        type: 'linear',
        scaleLabel: {
          labelString: 'TvOC (ppb)',
          display: true,
        },
        position: 'left',
      },
      {
        id: 'CO2',
        type: 'linear',
        scaleLabel: {
          labelString: 'CO2 (ppm)',
          display: true,
        },
        position: 'right',
      }]
    }
  };
   const chartWaterOptions = {
    scales: {
      yAxes: [{
        id: 'TDS',
        type: 'linear',
        scaleLabel: {
          labelString: 'TDS (ppm)',
          display: true,
        },
        position: 'left',
      },
      {
        id: 'WATERTEMP',
        type: 'linear',
        scaleLabel: {
          labelString: 'Water Temperature (°C)',
          display: true,
        },
        position: 'left',
      },
      {
        id: 'WATERL',
        type: 'linear',
        scaleLabel: {
          labelString: 'Water Level ()',
          display: true,
        },
        position: 'right',
      }]
    }
  };
  const chartLightOptions = {
    scales: {
      yAxes: [{
        id: 'VisibleL',
        type: 'linear',
        scaleLabel: {
          labelString: 'Visible Light ()',
          display: true,
        },
        position: 'left',
      },
        {
        id: 'IR',
        type: 'linear',
        scaleLabel: {
          labelString: 'IR ()',
          display: true,
        },
        position: 'left',
      },      
      {
        id: 'UV',
        type: 'linear',
        scaleLabel: {
          labelString: 'UV ()',
          display: true,
        },
        position: 'right',
      }]
    }
  };
  const  image = new Image();
  image.onload = function()
  {
   document.getElementById("photo").src = image.src;
  }
  image.src="https://hydrocloud.blob.core.windows.net/webcam/picture.jpg"
  // Get the context of the canvas element we want to select
  const ctx = document.getElementById('iotChart').getContext('2d');
  const myLineChart = new Chart(
    ctx,
    {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });
  const ctxgaz = document.getElementById('iotGazChart').getContext('2d');
  const myLineGazChart = new Chart(
    ctxgaz,
    {
      type: 'line',
      data: chartGazData,
      options: chartGazOptions,
    });
  const ctxLight = document.getElementById('iotLightChart').getContext('2d');
  const myLineLightChart = new Chart(
    ctxLight,
    {
      type: 'line',
      data: chartLightData,
      options: chartLightOptions,
    });
   const ctxWater = document.getElementById('iotWaterChart').getContext('2d');
  const myLineWaterChart = new Chart(
    ctxWater,
    {
      type: 'line',
      data: chartWaterData,
      options: chartWaterOptions,
    });
  // Manage a list of devices in the UI, and update which device data the chart is showing
  // based on selection
  let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  const listOfDevices = document.getElementById('listOfDevices');
  function OnSelectionChange() {
    const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
    chartData.labels = device.timeData;
    chartData.datasets[0].data = device.temperatureData;
    chartData.datasets[1].data = device.humidityData;
    chartGazData.labels = device.timeData;
    chartGazData.datasets[0].data = device.tvOCData;
    chartGazData.datasets[1].data = device.CO2Data;
    chartLightData.labels = device.timeData;
    chartLightData.datasets[0].data = device.VisibleLData;
    chartLightData.datasets[1].data = device.IRData;
    chartLightData.datasets[2].data = device.UVData;
    chartWaterData.labels = device.timeData;
    chartWaterData.datasets[0].data = device.TDSData;
    chartWaterData.datasets[1].data = device.WATERLData;
    chartWaterData.datasets[2].data = device.WATERTEMPData;
    myLineChart.update();
    myLineLightChart.update();
    myLineGazChart.update();
    myLineWaterChart.update();
    
  }
  listOfDevices.addEventListener('change', OnSelectionChange, false);

  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and temperature
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  webSocket.onmessage = function onMessage(message) {
    try {
      const messageData = JSON.parse(message.data);
      console.log(messageData);

      // time and either temperature or humidity are required
      if (!messageData.MessageDate || (!messageData.IotData.temperature && !messageData.IotData.humidity)) {
        return;
      }

      // find or add device to list of tracked devices
      const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);
      
      if (existingDeviceData) {
        existingDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity,messageData.IotData.tVOC,messageData.IotData.CO2,
                                   messageData.IotData.Visible,messageData.IotData.IR,messageData.IotData.UV,messageData.IotData.TDS,messageData.IotData.WaterLevel,messageData.IotData.WaterTemp);
      } else {
        const newDeviceData = new DeviceData(messageData.DeviceId);
        trackedDevices.devices.push(newDeviceData);
        const numDevices = trackedDevices.getDevicesCount();
        deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
        newDeviceData.addData(messageData.MessageDate, messageData.IotData.temperature, messageData.IotData.humidity,messageData.IotData.tVOC,messageData.IotData.CO2,
                              messageData.IotData.Visible,messageData.IotData.IR,messageData.IotData.UV,messageData.IotData.TDS,messageData.IotData.WaterLevel,messageData.IotData.WaterTemp);
        
        // add device to the UI list
        const node = document.createElement('option');
        const nodeText = document.createTextNode(messageData.DeviceId);
        node.appendChild(nodeText);
        listOfDevices.appendChild(node);

        // if this is the first device being discovered, auto-select it
        if (needsAutoSelect) {
          needsAutoSelect = false;
          listOfDevices.selectedIndex = 0;
          OnSelectionChange();
        }
      }
      if(messageData.IotData.PHOTO===1)
      {
        image.src="https://hydrocloud.blob.core.windows.net/webcam/picture.jpg?t=" + new Date().getTime();
      }
      myLineChart.update();
      myLineLightChart.update();
      myLineGazChart.update();
      myLineWaterChart.update();
    } catch (err) {
      console.error(err);
    }
  };
});
