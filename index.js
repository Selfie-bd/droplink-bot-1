const { Telegraf } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);

const axios = require('axios');
const path = require('path');

const { Client } = require('pg');
const client = new Client({
    host: 'ec2-18-208-97-23.compute-1.amazonaws.com',
    user: 'pamtcqktcecmyb',
    password: '51ca24c01af487cc33e99e5488bacc82d1d176ae7e55d1f0e2f43c61041f66dd',
    database: 'd51cks1n66f7gd',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

client.connect();

const express = require('express');
const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get('*', async (req, res) => {
    console.log('req===', req.path);
    let cryptID = '';

    if (req.path) cryptID = req.path.split('/')[1];

    console.log('cryptID==', cryptID)

    if (cryptID) {
        await client.query(`SELECT droplink FROM tg_droplink_data WHERE uniq_id = \'${cryptID}\'`, (err, result) => {
            if (err) {
                console.log('errr', err);
                return;
            }
            else {
                console.log('results', result);
                if (result.rows.length) {
                    res.render(path.join(__dirname + '/index.ejs'), {
                        cryptID: cryptID
                    });
                } else {
                    res.send('File is removed or something went wrong with the file. Please contact owner !!');
                }
            }
        });
    } else {
        res.send('Welcome !!');
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

bot.on('text', async (ctx) => {
    console.log('ctx', ctx.message.text);
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
