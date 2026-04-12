const db = require('../config/db');

const insertSensorData = async(sensorId, value) => {
    const query = 'INSERT INTO data_sensors (idss, value) VALUES (?, ?)';

    const [result] = await db.execute(query, [sensorId, value]);

    return result;
}

const getSensorDataAdvance = async (filters, sort, pagination) => {
    let baseQuery = `FROM data_sensors AS ds JOIN sensors AS s ON ds.idss = s.id`;
    let whereClause = [];
    let queryParams = [];

    const { searchText, selectedFilters } = filters;

    let sensorTypes = [];
    if (selectedFilters.includes('temp')) sensorTypes.push(1);
    if (selectedFilters.includes('hum')) sensorTypes.push(2);
    if (selectedFilters.includes('light')) sensorTypes.push(3);

    if (sensorTypes.length > 0) {
        whereClause.push(`ds.idss IN (${sensorTypes.join(',')})`);
    }
    else {
        whereClause.push(`1 = 0`);
    }

    if (searchText && searchText.trim() !== '') {
        let searchConditions = [];
        
        let textParam = `%${searchText.trim()}%`;
        
        let textCleanParam = `%${searchText.replace(/[\s\/\-:]/g, '')}%`;

        let timeCondition = `(
            CAST(ds.time AS CHAR) LIKE ? OR 
            DATE_FORMAT(ds.time, '%Y/%m/%d - %H:%i:%s') LIKE ? OR 
            DATE_FORMAT(ds.time, '%Y%m%d%H%i%s') LIKE ? OR
            DATE_FORMAT(ds.time, '%Y-%m-%d %H:%i:%s') LIKE ?
        )`;
        
        let timeParams = [textParam, textParam, textCleanParam, textParam];

        if (selectedFilters.includes('value')) {
            searchConditions.push(`CAST(ds.value AS CHAR) LIKE ?`);
            queryParams.push(textParam);
        } 
        else if (selectedFilters.includes('time')) {
            searchConditions.push(timeCondition);
            queryParams.push(...timeParams);
        } 
        else {
            searchConditions.push(`CAST(ds.value AS CHAR) LIKE ?`);
            searchConditions.push(`s.name LIKE ?`);
            searchConditions.push(timeCondition);
            queryParams.push(textParam, textParam, ...timeParams);
        }

        if (searchConditions.length > 0) {
            whereClause.push(`(${searchConditions.join(' OR ')})`);
        }
    }

    let whereString = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

    let countSql = `SELECT COUNT(*) as total ${baseQuery} ${whereString}`;
    const [[{ total }]] = await db.query(countSql, queryParams);

    const sortMap = { id: 'ds.id', time: 'ds.time', name: 's.name', value: 'ds.value'};
    let sortCol = sortMap[sort.key] || 'ds.time';
    let sortDir = (sort.direction || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const limit = Number(pagination.limit) || 10;
    const page = Number(pagination.page) || 1;
    const offset = (page - 1) * limit;

    let orderSql = '';
    if (sort.key === 'name' || sort.key === 'value') {
        orderSql = `ORDER BY ${sortCol} ${sortDir}, ds.id DESC`;
    } else {
        orderSql = `ORDER BY ${sortCol} ${sortDir}, ds.id ${sortDir}`;
    }

    let dataSql = `SELECT ds.id, s.name, ds.value, ds.time ${baseQuery} ${whereString} ${orderSql} LIMIT ? OFFSET ?`;

    const dataParams = [...queryParams, limit, offset];
    const [rows] = await db.query(dataSql, dataParams);

    return { total, rows };
}

module.exports = {
    insertSensorData,
    getSensorDataAdvance
};