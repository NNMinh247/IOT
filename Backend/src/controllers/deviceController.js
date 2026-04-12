const deviceModel = require('../models/deviceModel');
const mqttClient = require('../services/mqttService');

const getStatus = async (req, res) => {
    try {
        const rows = await deviceModel.getLatestDeviceStatus();
        const pendingRows = await deviceModel.getPendingDevices();

        let status = { fan: false, pump: false, light: false };
        let pending = { fan: false, pump: false, light: false };

        rows.forEach(r => {
            if (r.iddv == 1) status.fan = (r.action.toLowerCase().trim() === 'bật');
            if (r.iddv == 2) status.pump = (r.action.toLowerCase().trim() === 'bật');
            if (r.iddv == 3) status.light = (r.action.toLowerCase().trim() === 'bật');
        });

        pendingRows.forEach(r => {
            if (r.iddv == 1) pending.fan = true;
            if (r.iddv == 2) pending.pump = true;
            if (r.iddv == 3) pending.light = true;
        });

        res.status(200).json({ success: true, data: status, pending: pending });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

const controlDevice = async (req, res) => {
    try {
        const { device_id, action } = req.body;

        if (!device_id || !action) {
            return res.status(400).json({ success: false, message: 'Thiếu tham số'});
        }

        const historyId = await deviceModel.insertAction(device_id, action);
        
        const deviceMap = { 1: 'LED1', 2: 'LED2', 3: 'LED3' };
        const actionStr = action === 'Bật' ? 'ON' : 'OFF';
        const payload = `${deviceMap[device_id]}_${actionStr}`;

        mqttClient.publish('devices/control', payload);
        
        setTimeout(async () => {
            try {
                const isTimeout = await deviceModel.checkAndUpdateTimeout(historyId);
                if (isTimeout) {
                    const io = req.app.get('io');
                    if (io) {
                        const deviceName = device_id === 1 ? 'fan' : (device_id === 2 ? 'pump' : 'light');
                        io.emit('device_timeout', { device: deviceName, message: 'Thiết bị mất kết nối, lệnh thất bại!' });
                    }
                }
            } catch (error) {
                console.error('Lỗi khi kiểm tra timeout:', error);
            }
        }, 10000);

        res.status(200).json({ 
            success: true, 
            message: 'Đã gửi lệnh xuống phần cứng',
        });
    }
    catch (error) {
        console.error('Lỗi tại controlDevice:', error);
        res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
    }
}

module.exports = {
    controlDevice,
    getStatus
}