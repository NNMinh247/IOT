const db = require('../config/db');

const getActionHistoryAdvanced = async (filters, pagination) => {
    let baseQuery = `FROM action_history ah JOIN devices d ON ah.iddv = d.id`;
    let whereClause = []; 
    let queryParams = [];

    const { searchTime, devices, actions, statuses } = filters;

    if (devices && devices.length > 0) {
        whereClause.push(`ah.iddv IN (${devices.join(',')})`);
    } else {
        whereClause.push(`1 = 0`);
    }

    if (actions && actions.length > 0) {
        const placeholders = actions.map(() => '?').join(',');
        whereClause.push(`ah.action IN (${placeholders})`);
        queryParams.push(...actions);
    } else {
        whereClause.push(`1 = 0`);
    }

    if (statuses && statuses.length > 0) {
        const placeholders = statuses.map(() => '?').join(',');
        whereClause.push(`ah.status IN (${placeholders})`);
        queryParams.push(...statuses);
    } else {
        whereClause.push(`1 = 0`);
    }

    if (searchTime && searchTime.trim() !== '') {
        let textParam = `%${searchTime.trim()}%`;
        let textCleanParam = `%${searchTime.replace(/[\s\/\-:]/g, '')}%`;

        whereClause.push(`(
            CAST(ah.time AS CHAR) LIKE ? OR 
            DATE_FORMAT(ah.time, '%Y/%m/%d - %H:%i:%s') LIKE ? OR 
            DATE_FORMAT(ah.time, '%Y%m%d%H%i%s') LIKE ? OR
            DATE_FORMAT(ah.time, '%Y-%m-%d %H:%i:%s') LIKE ?
        )`);
        
        queryParams.push(textParam, textParam, textCleanParam, textParam);
    }

    let whereString = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

    let countSql = `SELECT COUNT(*) as total ${baseQuery} ${whereString}`;
    const [[{ total }]] = await db.query(countSql, queryParams);

    const limit = Number(pagination.limit) || 10;
    const page = Number(pagination.page) || 1;
    const offset = (page - 1) * limit;

    let dataSql = `SELECT ah.id, d.name as device, ah.action, ah.status, ah.time ${baseQuery} ${whereString} ORDER BY ah.id DESC LIMIT ? OFFSET ?`;

    const dataParams = [...queryParams, limit, offset];
    const [rows] = await db.query(dataSql, dataParams);

    return { total, rows};
};

module.exports = {
    getActionHistoryAdvanced
};