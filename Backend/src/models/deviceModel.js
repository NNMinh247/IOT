const db = require('../config/db');

const insertAction = async (deviceId, action) => {
    const query = `INSERT INTO action_history (iddv, action, status) VALUES (?, ?, 'Chờ')`;
    const [result] = await db.execute(query, [deviceId, action]);
    
    return result.insertId;
};

const updateActionStatus = async (historyId, newStatus) => {
    const query = `UPDATE action_history SET status = ? WHERE id = ?`;
    const [result] = await db.execute(query, [newStatus, historyId]);

    return result;
}

const getLatestDeviceStatus = async () => {
    const query = `
        SELECT 
            iddv,
            action
        FROM action_history
        WHERE id IN (
            SELECT MAX(id) FROM action_history
            WHERE status = 'Thành công' GROUP BY iddv
        )
    `;

    const [rows] = await db.execute(query);

    return rows;
}

const checkAndUpdateTimeout = async (historyId) => {
    const [[row]] = await db.execute(`SELECT status FROM action_history WHERE id = ?`, [historyId]);

    if (row && row.status === 'Chờ') {
        await db.execute(`UPDATE action_history SET status = 'Lỗi' WHERE id = ?`, [historyId]);
        return true;
    }

    return false;
}

module.exports = {
    insertAction,
    updateActionStatus,
    getLatestDeviceStatus,
    checkAndUpdateTimeout
}
