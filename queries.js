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
    const id = parseInt(request.params.id);

    try {
        response = await pool.query('SELECT * FROM tg_droplink_data WHERE id = $1', [id]);
        return { data: response.rows, total: response.rows.length };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

const getDataByUniqId = async (request) => {
    console.log('request.params', request.params)
    const uniq_id = request.params.id

    try {
        response = await pool.query('SELECT * FROM tg_droplink_data WHERE uniq_id = $1', [uniq_id]);
        return { data: response.rows, total: response.rows.length };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

const getDataByOrgUrl = async (request) => {
    console.log('request.params', request.params)
    const url = request.params.url

    try {
        response = await pool.query('SELECT * FROM tg_droplink_data WHERE org_url = $1', [url]);
        return { data: response.rows, total: response.rows.length };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

const getDataByDroplink = async (request) => {
    console.log('request.params', request.params)
    const droplink = request.params.droplink

    try {
        response = await pool.query('SELECT * FROM tg_droplink_data WHERE droplink = $1', [droplink]);
        return { data: response.rows, total: response.rows.length };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

const createData = async (request) => {
    const [ droplink, org_url, uniq_id ] = request.body;

    try {
        response = await pool.query('INSERT INTO tg_droplink_data (droplink, org_url, uniq_id) VALUES ($1, $2, $3)', [droplink, org_url, uniq_id]);
        return { data: response };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

const updateData = async (request) => {
    const id = parseInt(request.params.id);
    const [ droplink, org_url, uniq_id ] = request.body;

    try {
        response = await pool.query('UPDATE tg_droplink_data SET droplink = $1, org_url = $2, uniq_id = $3 WHERE id = $4', [droplink, org_url, uniq_id, id]);
        return { data: response };
    } catch (error) {
        throw { error: { msg: 'Something Went Wrong !!!', err: error } };
    };
};

const deleteData = async (request) => {
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
    deleteData,
};
