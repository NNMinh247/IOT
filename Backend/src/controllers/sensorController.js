const sensorModel = require('../models/sensorModel');

let currentDashboardData = { temp: 0, hum: 0, light: 0 };

const receiveSensorData = async (req, res) => {
    try {
        const { sensor_id, value } = req.body;

        if (!sensor_id || value === undefined) {
            return res.status(400).json({success: false, message: 'Thiếu thông tin'});
        }

        const result = await sensorModel.insertSensorData(sensor_id, value);

        if (sensor_id === 1) currentDashboardData.temp = value;
        if (sensor_id === 2) currentDashboardData.hum = value;
        if (sensor_id === 3) currentDashboardData.light = value;

        const io = req.app.get('io');
        const now = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        io.emit('update_dashboard', {
            time: timeString,
            temp: currentDashboardData.temp,
            hum: currentDashboardData.hum,
            light: currentDashboardData.light
        });

        res.status(201).json({success: true, message: 'Đã lưu và phát Socket thành công'});
    } 
    catch (error) {
        console.error('Lỗi tại receiveSensorData:', error);
        res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
    }
};

const getSensorData = async (req, res) => {
    try {
        const {
            page = 1, limit = 10,
            dateDD, dateMM, dateYYYY,
            timeHH, timeMM, timeSS,
            name, value,
            sortKey = 'time', sortDir = 'desc'
        } = req.query;

        const filters = { dateDD, dateMM, dateYYYY, timeHH, timeMM, timeSS, name, value };
        const sort = { key: sortKey, direction: sortDir };
        const pagination = { page, limit };

        const { total, rows } = await sensorModel.getSensorDataAdvance(filters, sort, pagination);

        res.status(200).json({
            success: true,
            message: 'Lấy dữ liệu thành công',
            data: rows,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalItems: total,
                itemsPerPage: Number(limit)
            }
        });
    } catch (error) {
        console.error('Lỗi tại getSensorData:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi server nội bộ' 
        });
    }
};

module.exports = {
    getSensorData, receiveSensorData
};