const Pool = require('pg').Pool;
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

const getData = async () => {
    try {
        response = await pool.query('SELECT * FROM tg_droplink_data ORDER BY id ASC');
        return { data: response.rows, total: response.rows.length };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

const getDataById = async (request) => {
    console.log('getDataById', request.params.id);
    const id = parseInt(request.params.id);
    try {
        response = await pool.query('SELECT * FROM tg_droplink_data WHERE id = $1', [id]);
        return { data: response.rows, total: response.rows.length };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

const getDataByUniqId = async (request) => {
    console.log('getDataByUniqId', request.params.id);
    const uniq_id = request.params.id;
    try {
        response = await pool.query('SELECT * FROM tg_droplink_data WHERE uniq_id = $1', [uniq_id]);
        return { data: response.rows, total: response.rows.length };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

const getDataByOrgUrl = async (request) => {
    console.log('getDataByOrgUrl', request.params.url);
    const url = request.params.url;
    try {
        response = await pool.query('SELECT * FROM tg_droplink_data WHERE org_url = $1', [url]);
        return { data: response.rows, total: response.rows.length };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

const getDataByDroplink = async (request) => {
    console.log('getDataByDroplink', request.params.droplink);
    const droplink = request.params.droplink;
    try {
        response = await pool.query('SELECT * FROM tg_droplink_data WHERE droplink = $1', [droplink]);
        return { data: response.rows, total: response.rows.length };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

const createData = async (request) => {
    console.log('createData', request.body);
    const [ droplink, org_url, uniq_id, video_name, video_size, video_duration ] = request.body;
    try {
        response = await pool.query('INSERT INTO tg_droplink_data (droplink, org_url, uniq_id, video_name, video_size, video_duration) VALUES ($1, $2, $3, $4, $5, $6)', [droplink, org_url, uniq_id, video_name, video_size, video_duration]);
        return { data: response };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

const updateData = async (request) => {
    console.log('updateData', request.body);
    const [ droplink, org_url, uniq_id, video_name, video_size, video_duration, id ] = request.body;
    try {
        response = await pool.query('UPDATE tg_droplink_data SET droplink = $1, org_url = $2, uniq_id = $3, video_name = $4, video_size = $5, video_duration = $6 WHERE id = $7', [droplink, org_url, uniq_id, video_name, video_size, video_duration, id]);
        return { data: response };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

const deleteData = async (request) => {
    console.log('deleteData', request.params.id);
    const id = parseInt(request.params.id);
    try {
        response = await pool.query('DELETE FROM tg_droplink_data WHERE id = $1', [id]);
        return { data: response };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

module.exports = {
    getData,
    getDataById,
    getDataByUniqId,
    getDataByOrgUrl,
    getDataByDroplink,
    createData,
    updateData,
    deleteData
};
