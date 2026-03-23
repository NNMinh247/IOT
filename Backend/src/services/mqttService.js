const mqtt = require('mqtt');
require('dotenv').config();

const deviceModel = require('../models/deviceModel');
const sensorModel = require('../models/sensorModel');

const db = require('../config/db');

const client = mqtt.connect(process.env.MQTT_BROKER, {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS
});

client.on('connect', () => {
    console.log('Đã kết nối tới MQTT Broker');

    client.subscribe('devices/status');
    client.subscribe('sensors/data');
    client.subscribe('devices/sync');
});

let socketIo;
const setSocketIo = (io) => {
    socketIo = io;
}

client.on('message', async (topic, message) => {
    const payloadStr = message.toString();

    try {
        if (topic === 'sensors/data') {
            const data = JSON.parse(payloadStr);

            await sensorModel.insertSensorData(1, data.temp);
            await sensorModel.insertSensorData(2, data.hum);
            await sensorModel.insertSensorData(3, data.light);

            if (socketIo) {
                const now = new Date();
                const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            
                socketIo.emit('update_dashboard', {
                    time: timeString,
                    temp: data.temp,
                    hum: data.hum,
                    light: data.light
                });
            }
        }

        if (topic === 'devices/status') {
            const data = JSON.parse(payloadStr);
            
            const finalStatus = data.result === 'success' ? 'Thành công' : 'Thất bại';
            
            await db.execute(`UPDATE action_history SET status = ? WHERE status = 'Chờ'`, [finalStatus]);

            if (socketIo) {
                socketIo.emit('device_status_update', data);
            }
        }

        if (topic === 'devices/sync') {
            const rows = await deviceModel.getLatestDeviceStatus();
            let s1 = 'OFF', s2 = 'OFF', s3 = 'OFF';
            rows.forEach(r => {
                if (r.iddv === 1) s1 = r.action === 'Bật' ? 'ON' : 'OFF';
                if (r.iddv === 2) s2 = r.action === 'Bật' ? 'ON' : 'OFF';
                if (r.iddv === 3) s3 = r.action === 'Bật' ? 'ON' : 'OFF';
            });
            
            client.publish('devices/control', `LED1_${s1}`);
            client.publish('devices/control', `LED2_${s2}`);
            client.publish('devices/control', `LED3_${s3}`);
            // setTimeout(() => client.publish('devices/control', `LED1_${s1}`), 100);
            // setTimeout(() => client.publish('devices/control', `LED2_${s2}`), 300);
            // setTimeout(() => client.publish('devices/control', `LED3_${s3}`), 500);
        }
    }
    catch (error) {
        console.error(`Lỗi khi xử lý message MQTT (Topic: ${topic}):`, error);
    }
});

module.exports = client;
module.exports.setSocketIo = setSocketIo;