const db = require('../config/db');

const insertSensorData = async(sensorId, value) => {
    const query = 'INSERT INTO data_sensors (idss, value) VALUES (?, ?)';

    const [result] = await db.execute(query, [sensorId, value]);

    return result;
}

const getSensorDataAdvance = async (filters, sort, pagination) => {
    let baseQuery = `FROM data_sensors AS ds
                    JOIN sensors AS s 
                    ON ds.idss = s.id`;
    let whereClause = [];
    let queryParams = [];

    if (filters.dateDD) {
        whereClause.push(`DAY(ds.time) = ?`);
        queryParams.push(filters.dateDD);
    }

    if (filters.dateMM) {
        whereClause.push('MONTH(ds.time) = ?');
        queryParams.push(filters.dateMM);
    }

    if (filters.dateYYYY) {
        whereClause.push(`YEAR(ds.time) = ?`);
        queryParams.push(filters.dateYYYY);
    }

    if (filters.timeHH) {
        whereClause.push(`HOUR(ds.time) = ?`);
        queryParams.push(filters.timeHH)
    }

    if (filters.timeMM) {
        whereClause.push(`MINUTE(ds.time) = ?`);
        queryParams.push(filters.timeMM);
    }

    if (filters.timeSS) {
        whereClause.push(`SECOND(ds.time) = ?`);
        queryParams.push(filters.timeSS);
    }

    if (filters.name) {
        whereClause.push(`s.name LIKE ?`);
        queryParams.push('%' + filters.name + '%');
    }

    if (filters.value) {
        whereClause.push(`CAST(ds.value AS CHAR) LIKE ?`);
        queryParams.push('%' + filters.value + '%');
    }

    let whereString = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : ' ';

    let countSql = `SELECT COUNT(*) as total ${baseQuery} ${whereString}`;
    const [[{ total }]] = await db.query(countSql, queryParams);

    const sortMap = { id: 'ds.id', time: 'ds.time', name: 's.name', value: 'ds.value'};
    let sortCol = sortMap[sort.key] || 'ds.time';
    let sortDir = sort.direction.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const limit = Number(pagination.limit) || 10;
    const page = Number(pagination.page) || 1;
    const offset = (page - 1) * limit;

    let dataSql = `SELECT ds.id, s.name, ds.value, ds.time ${baseQuery} ${whereString} ORDER BY ${sortCol} ${sortDir}, ds.id ${sortDir} LIMIT ? OFFSET ?`;

    const dataParams = [...queryParams, limit, offset];
    const [rows] = await db.query(dataSql, dataParams);

    return { total, rows };
}

module.exports = {
    insertSensorData,
    getSensorDataAdvance
};