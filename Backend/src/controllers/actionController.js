const actionModel = require('../models/actionModel');

const getActionHistory = async (req, res) => {
    try {
        const {
            page = 1, limit = 10,
            dateDD, dateMM, dateYYYY,
            timeHH, timeMM, timeSS
        } = req.query;

        const filters = { dateDD, dateMM, dateYYYY, timeHH, timeMM, timeSS };
        const pagination = { page, limit };

        const { total, rows } = await actionModel.getActionHistoryAdvanced(filters, pagination);

        res.status(200).json({
            success: true,
            message: 'Lấy lịch sử hoạt động thành công',
            data: rows,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                totalItems: total,
                itemsPerPage: Number(limit)
            }
        });
    }
    catch (error) {
        console.error('Lỗi tại getActionHistory:', error);
        res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
    }
}

module.exports = {
    getActionHistory
}