const { Telegraf } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);

const axios = require('axios');
const path = require('path');

const db = require('./queries');

const { Client } = require('pg');
const client = new Client({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DBPORT,
    ssl: { rejectUnauthorized: false }
});

client.connect();

const express = require('express');
const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get('/', async (req, res) => {
    res.send('Welcome !!');
});

app.get('/:id', async (req, res) => {
    if (req.params.id === 'favicon.ico') return;
    console.log('req===', req);
    const results = await db.getDataByUniqId(req, res);
    console.log('hello', results);

    if (results.length) {
        const intentUrl = results[0].org_url.replace(/(^\w+:|^)\/\//, '');
        res.render(path.join(__dirname + '/index.ejs'), {
            video: results[0].org_url,
            url: `intent://${intentUrl}#Intent;package=com.playit.videoplayer;action=android.intent.action.VIEW;scheme=http;type=video/mp4;end`
        });
    } else {
        res.send('File is removed or something went wrong with the file. Please contact owner !!');
    }
});

app.listen(process.env.PORT || 5000);

bot.catch((err, ctx) => {
    console.log('ctx--catch==========>', err);
    let mainError;
    if (err.description) mainError = err.description.split(': ')[1];
    else if (typeof (err) == 'string') {
        mainError = err.split(': ')[1];
    }
    if (!mainError) return;
    ctx.reply(mainError);
});

/*

Bot

*/

bot.start((ctx) => {
    ctx.reply(`Hi *${ctx.from.first_name}*!!\n\n🤖️ Official private bot of @temp\\_demo\nfor short URL to DropLink`, {
        parse_mode: 'markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "📂 Join Our Main Channel", url: 'https://t.me/my_channels_list_official' }
                ],
                [
                    { text: "Help 💡️", callback_data: 'help' }
                ]
            ]
        }
    });
});

bot.command('check', (ctx) => {
    client.query(`SELECT * FROM tg_droplink_data`, (err, result) => {
        if (err) {
            ctx.reply('Something went wrong !!');
            console.log('errr', err);
        }
        else {
            console.log('results', result);
        }
    });
});

bot.command('delete_all', (ctx) => {
    client.query(`DELETE FROM tg_droplink_data WHERE id = 1`, (err, result) => {
        if (err) {
            ctx.reply('Something went wrong !!');
            console.log('errr', err);
        }
        else {
            console.log('results', result);
        }
    });
});

bot.on('text', async (ctx) => {
    console.log('ctx', ctx.message.text);
    if ((ctx.message.text).includes('note')) return ctx.reply('note excepted');
    const URL = ctx.message.text;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const shortURL = ctx.message.text.match(urlRegex);
    console.log('url---', shortURL)

    if (shortURL.length) {
        // check in db exists or not
        let isExists = false;

        const findQuery = `SELECT droplink FROM tg_droplink_data WHERE org_url = \'${URL}\'`

        client.query(findQuery, async (err, result) => {
            if (err) {
                ctx.reply('Something went wrong !!');
                console.log('errr', err);
                return;
            }
            else {
                console.log('results', result);
                if (result.rows.length) isExists = true;

                if (isExists) return ctx.reply('Already short link added ==> link');

                const uniqID = (new Date()).getTime().toString(36);
                const linkToShort = `https://droplink-bot.herokuapp.com/${uniqID}`
                const response = await axios.get(`https://droplink.co/api?api=${process.env.DROPLINK_API_TOKEN}&url=${linkToShort}`);

                console.log('response', response)
                if (response.data.status === 'success') {
                    const insertQuery = `INSERT INTO tg_droplink_data (droplink, org_url, uniq_id) VALUES (\'${response.data.shortenedUrl}\', \'${URL}\', \'${uniqID}\')`

                    client.query(insertQuery, (err, result) => {
                        if (err) {
                            ctx.reply('Something went wrong !!');
                            return console.log('errr', err);
                        }
                        ctx.reply(response.data.shortenedUrl);
                        console.log('results', result);
                    });
                }
            }
        });
    }
});

bot.launch();
