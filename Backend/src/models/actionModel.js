const db = require('../config/db');

const getActionHistoryAdvanced = async (filters, pagination) => {
    let baseQuery = `FROM action_history ah JOIN devices d ON ah.iddv = d.id`;
    let whereClause = [];
    let queryParams = [];

    if (filters.dateDD) {
        whereClause.push(`DAY(ah.time) = ?`);
        queryParams.push(filters.dateDD);
    }

    if (filters.dateMM) {
        whereClause.push(`MONTH(ah.time) = ?`);
        queryParams.push(filters.dateMM);
    }

    if (filters.dateYYYY) {
        whereClause.push(`YEAR(ah.time) = ?`);
        queryParams.push(filters.dateYYYY);
    }

    if (filters.timeHH) {
        whereClause.push(`HOUR(ah.time) = ?`);
        queryParams.push(filters.timeHH);
    }

    if (filters.timeMM) {
        whereClause.push(`MINUTE(ah.time) = ?`);
        queryParams.push(filters.timeMM);
    }

    if (filters.timeSS) {
        whereClause.push(`SECOND(ah.time) = ?`);
        queryParams.push(filters.timeSS);
    }

    let whereString = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

    let countSql = `SELECT COUNT(*) as total ${baseQuery} ${whereString}`;
    const [[{ total }]] = await db.query(countSql, queryParams);

    const limit = Number(pagination.limit) || 10;
    const page = Number(pagination.page) || 1;
    const offset = (page - 1) * limit;

    let dataSql = `SELECT ah.id, d.name as device, ah.action, ah.status, ah.time ${baseQuery} ${whereString} ORDER BY ah.time DESC LIMIT ? OFFSET ?`;

    const dataParams = [...queryParams, limit, offset];
    const [rows] = await db.query(dataSql, dataParams);

    return { total, rows};
};

module.exports = {
    getActionHistoryAdvanced
};