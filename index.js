const { Telegraf } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);

const axios = require('axios');
const path = require('path');

const db = require('./queries');

const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});
client.connect();

const express = require('express');
const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get('/', async (req, res) => {
    console.log('req==========/=======', req);
    res.send('Welcome !!');
});

app.get('/:id', async (req, res) => {
    console.log('req==========/id=======', req);
    if ((req.params.id).includes('.')) return;
    
    const results = await db.getDataByUniqId(req, res);

    if (results.total > 0) {
        const intentUrl = results.data[0].org_url.replace(/(^\w+:|^)\/\//, '');
        res.render(path.join(__dirname + '/index.ejs'), {
            video: results.data[0].org_url,
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

Functions

*/

function DBReply (ctx, results) {
    if (results.error) {
        return ctx.reply(results.error.msg);
    }
    if (results.total > 0) {
        const res = results.data[0];
        ctx.reply(`*Showing results from DB*\n\n*ID :* \`${res.id}\`\n\n*Uniq ID :* \`${res.uniq_id}\`\n\n*Original URL :* \`${res.org_url}\`\n\n*Droplink :* \`${res.droplink}\``, {
            parse_mode: 'markdown'
        });
    } else {
        ctx.reply('No results found !!');
    }
};

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

// Admin only command

bot.command('create', async (ctx) => {
    const res = await client.query('CREATE TABLE tg_droplink_data (id SERIAL PRIMARY KEY, droplink VARCHAR, org_url VARCHAR, uniq_id VARCHAR)');
    console.log('res', res)
});

bot.command('delete', async (ctx) => {
    const res = await client.query('DROP TABLE IF EXISTS tg_droplink_data');
    console.log('res', res)
});

bot.command('get_by_id', async (ctx) => {
    // await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgQAAxkBAAPhYYzeh51we7390tj603tUDDLFIGAAAuwJAAInyWhQvClj_JZUKPkiBA');
    const id = ctx.message.text.split('/get_by_id ')[1];

    const results = await db.getDataById( { params: { id: `${Number(id)}` } } );
    // ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
    return DBReply(ctx, results);
});

bot.command('get_by_url', async (ctx) => {
    // await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgQAAxkBAAPhYYzeh51we7390tj603tUDDLFIGAAAuwJAAInyWhQvClj_JZUKPkiBA');
    const url = ctx.message.text.split('/get_by_url ')[1];

    const results = await db.getDataByOrgUrl( { params: { url: `${url}` } } );
    // ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
    return DBReply(ctx, results);
});

bot.command('get_by_droplink', async (ctx) => {
    // await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgQAAxkBAAPhYYzeh51we7390tj603tUDDLFIGAAAuwJAAInyWhQvClj_JZUKPkiBA');
    const droplink = ctx.message.text.split('/get_by_droplink ')[1];

    const results = await db.getDataByDroplink( { params: { droplink: `${droplink}` } } );
    // ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
    return DBReply(ctx, results);
});

bot.command('get_by_uniqid', async (ctx) => {
    // await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgQAAxkBAAPhYYzeh51we7390tj603tUDDLFIGAAAuwJAAInyWhQvClj_JZUKPkiBA');
    const uniqId = ctx.message.text.split('/get_by_uniqid ')[1];

    const results = await db.getDataByUniqId( { params: { id: `${uniqId}` } } );
    // ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
    return DBReply(ctx, results);
});

bot.command('delete_data', async (ctx) => {
    // await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgQAAxkBAAPhYYzeh51we7390tj603tUDDLFIGAAAuwJAAInyWhQvClj_JZUKPkiBA');
    const id = ctx.message.text.split('/delete_data ')[1];
    
    const results = await db.deleteData( { params: { id: `${Number(id)}` } } );
    // ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
    
    if (results.error) {
        return ctx.reply(results.error.msg);
    }
    ctx.reply('Successfully deleted !!');
});

bot.command('delete_data', async (ctx) => {
    // await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgQAAxkBAAPhYYzeh51we7390tj603tUDDLFIGAAAuwJAAInyWhQvClj_JZUKPkiBA');
    const id = ctx.message.text.split('/delete_data ')[1];
    
    const results = await db.deleteData( { params: { id: `${Number(id)}` } } );
    // ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
    
    if (results.error) {
        return ctx.reply(results.error.msg);
    }
    ctx.reply('Successfully deleted !!');
});

bot.command('check', async (ctx) => {
    // await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgQAAxkBAAPhYYzeh51we7390tj603tUDDLFIGAAAuwJAAInyWhQvClj_JZUKPkiBA');
    
    const results = await db.getData();
    // ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
    
    if (results.error) {
        return ctx.reply(results.error.msg);
    }
    if (results.total > 0) {
        console.log('results', results.data)
    } else {
        ctx.reply('No results found !!');
    }
});

// user commands

bot.on('text', async (ctx) => {
    if ((ctx.message.text).includes('note')) return ctx.reply('note accepted');
    const URL = ctx.message.text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const shortURL = ctx.message.text.match(urlRegex);

    if (shortURL !== null && shortURL.length) {
        // check in db exists or not
        const results = await db.getDataByOrgUrl({ params: { url: `${URL}` } });
        if (results.error) {
            return ctx.reply(results.error.msg);
        }
        if (results.total > 0) return ctx.reply('Link is already available in database.');

        const uniqID = (new Date()).getTime().toString(36);
        const linkToShort = `https://droplink-bot.herokuapp.com/${uniqID}`;

        const response = await axios.get(`https://droplink.co/api?api=${process.env.DROPLINK_API_TOKEN}&url=${linkToShort}`);
        if (response.data.status === 'success') {
            db.createData({ body: [response.data.shortenedUrl, URL, uniqID] })
                .then((res) => {
                    if (res.err) {
                        ctx.reply('Something went wrong !!');
                        return console.log('errr', err);
                    }
                    ctx.reply(response.data.shortenedUrl);
                })
                .catch(err => {
                    ctx.reply(err)
                });
        }
    } else {
        ctx.reply('Please send a valid link to be shorten !!!')
    }
});

bot.launch();
