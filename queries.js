const Pool = require('pg').Pool;
require('dotenv').config();

const pool = new Pool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DBPORT,
    ssl: { rejectUnauthorized: false }
})

const getUsers = (request, response) => {
    // console.log('getusers-reques', request);
    // console.log('getuser-res', response)
    pool.query('SELECT * FROM tg_droplink_data ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        console.log('getuser-result', results)
        return response.status(200).json(results.rows)
    })
}

const getUserById = (request, response) => {
    console.log('getusers-reques', request.params);
    // console.log('getuser-res', response)
    const id = parseInt(request.params.id)

    pool.query('SELECT * FROM tg_droplink_data WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        console.log('getuser-result', results)
        return response.status(200).json(results.rows)
    })
}

const getDataByUniqId = async (request, response) => {
    console.log('request.params', request.params)
    const uniq_id = request.params.id

    try {
        response = await pool.query('SELECT * FROM tg_droplink_data WHERE uniq_id = $1', [uniq_id]);
        return response.rows;
    } catch (error) {
        throw error;
    }
}

const createUser = (request, response) => {
    const { droplink, org_url, uniq_id } = request.body

    pool.query('INSERT INTO tg_droplink_data (droplink, org_url, uniq_id) VALUES ($1, $2, $3)', [droplink, org_url, uniq_id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(201).send(`User added with ID: ${result.insertId}`)
    })
}

const updateUser = (request, response) => {
    const id = parseInt(request.params.id)
    const { name, email } = request.body

    pool.query(
        'UPDATE tg_droplink_data SET name = $1, email = $2 WHERE id = $3',
        [name, email, id],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`User modified with ID: ${id}`)
        }
    )
}

const deleteUser = (request, response) => {
    const id = parseInt(request.params.id)

    pool.query('DELETE FROM tg_droplink_data WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`User deleted with ID: ${id}`)
    })
}

module.exports = {
    getUsers,
    getUserById,
    getDataByUniqId,
    createUser,
    updateUser,
    deleteUser,
}
