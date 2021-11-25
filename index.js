const { Telegraf } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);

const axios = require('axios');
const path = require('path');

const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const db = require('./public/js/queries');
const func = require('./public/js/functions');

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
    res.send('Welcome !!');
});

app.get('/:id', async (req, res) => { 
    if ((req.params.id).includes('.')) return;
    
    const results = await db.getDataByUniqId(req);
    console.log('res--', results);
    if (results.total > 0) {
        const intentUrl = results.data[0].org_url.replace(/(^\w+:|^)\/\//, '');
        res.render(path.join(__dirname + '/public/ejs/index.ejs'), {
            video: results.data[0].org_url,
            video_name: results.data[0].video_name,
            video_size: results.data[0].video_size,
            video_duration: results.data[0].video_duration,
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
    const isAllowed = func.isAdmin(ctx);;
    if (!isAllowed.success) return ctx.reply(isAllowed.error);

    await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgUAAxkBAAE08sdhnjZwT5fAfZJCkdVlH6NMIgLf-gACagQAAq_pGVaiHwGxKU30MCIE');
    const id = ctx.message.text.split('/get_by_id ')[1];

    const results = await db.getDataById({ params: { id: `${Number(id)}` } });
    ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
    return func.sendReply(ctx, results);
});

bot.command('get_by_url', async (ctx) => {
    const isAllowed = func.isAdmin(ctx);;
    if (!isAllowed.success) return ctx.reply(isAllowed.error);

    await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgUAAxkBAAE08sdhnjZwT5fAfZJCkdVlH6NMIgLf-gACagQAAq_pGVaiHwGxKU30MCIE');
    const url = ctx.message.text.split('/get_by_url ')[1];

    const results = await db.getDataByOrgUrl({ params: { url: `${url}` } });
    ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
    return func.sendReply(ctx, results);
});

bot.command('get_by_droplink', async (ctx) => {
    const isAllowed = func.isAdmin(ctx);;
    if (!isAllowed.success) return ctx.reply(isAllowed.error);

    await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgUAAxkBAAE08sdhnjZwT5fAfZJCkdVlH6NMIgLf-gACagQAAq_pGVaiHwGxKU30MCIE');
    const droplink = ctx.message.text.split('/get_by_droplink ')[1];

    const results = await db.getDataByDroplink({ params: { droplink: `${droplink}` } });
    ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
    return func.sendReply(ctx, results);
});

bot.command('get_by_uniqid', async (ctx) => {
    const isAllowed = func.isAdmin(ctx);;
    if (!isAllowed.success) return ctx.reply(isAllowed.error);

    await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgUAAxkBAAE08sdhnjZwT5fAfZJCkdVlH6NMIgLf-gACagQAAq_pGVaiHwGxKU30MCIE');
    const uniqId = ctx.message.text.split('/get_by_uniqid ')[1];

    const results = await db.getDataByUniqId({ params: { id: `${uniqId}` } });
    ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
    return func.sendReply(ctx, results);
});

bot.command('delete_data', async (ctx) => {
    await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgUAAxkBAAE08vdhnjeGdMhMHh4XH1PpyRoBQVba7AACrwEAAkglCVeK2COVlaQ2mSIE');
    const id = ctx.message.text.split('/delete_data ')[1];

    const results = await db.deleteData({ params: { id: `${Number(id)}` } });
    ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);

    if (results.error) {
        return ctx.reply(results.error.msg);
    }
    ctx.reply('Successfully deleted !!');
});

bot.command('get_all_data', async (ctx) => {
    await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgUAAxkBAAE08sdhnjZwT5fAfZJCkdVlH6NMIgLf-gACagQAAq_pGVaiHwGxKU30MCIE');

    const results = await db.getData();
    ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);

    if (results.error) {
        return ctx.reply(results.error.msg);
    }
    if (results.total > 0) {
        ctx.reply('you got your results in response !!!');
        console.log('results', results.data)
    } else {
        ctx.reply('No results found !!');
    }
});

// user commands

bot.command('animation_to_photo', (ctx) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const shortURL = ctx.message.reply_to_message.caption.match(urlRegex);

    if (shortURL === null) return ctx.replace('Something wrong with the url !!');

    const fileUrl = ctx.message.text.split(' ')[1] || 'https://telegra.ph/file/66a8bf28af4180fad2e70.jpg';

    ctx.telegram.sendPhoto(ctx.chat.id, fileUrl,
        {
            caption: func.getCaption(shortURL[0], 'https://t.me/joinchat/dWGuvl4DkbU4OTg9'),
            parse_mode: 'markdown'
        }
    );
});

bot.command('short_to_droplink', async (ctx) => {
    await ctx.telegram.sendAnimation(ctx.chat.id, 'CAACAgUAAxkBAAE08vdhnjeGdMhMHh4XH1PpyRoBQVba7AACrwEAAkglCVeK2COVlaQ2mSIE');

    let video_name = 'Telegram : @my_channels_list_official';
    let video_size = 0;
    let video_duration = 0;
    
    if (ctx.message.reply_to_message.video) {
        video_name = ctx.message.reply_to_message.video.file_name;
        video_size = ctx.message.reply_to_message.video.file_size;
        video_duration = ctx.message.reply_to_message.video.duration;
    }

    if ((ctx.message.text).includes('note')) return ctx.reply('note accepted');

    const URL = ctx.message.text.split(' ')[1];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const shortURL = ctx.message.text.match(urlRegex);

    if (shortURL !== null && shortURL.length) {
        // check in db exists or not
        const results = await db.getDataByOrgUrl({ params: { url: `${URL}` } });
        if (results.error) {
            return ctx.reply(results.error.msg);
        }
        if (results.total > 0) return func.sendReply(ctx, results);

        const uniqID = (new Date()).getTime().toString(36);
        const linkToShort = `https://droplink-bot.herokuapp.com/${uniqID}`;

        const response = await axios.get(`https://droplink.co/api?api=${process.env.DROPLINK_API_TOKEN}&url=${linkToShort}`);
        if (response.data.status === 'success') {
            db.createData({ body: [response.data.shortenedUrl, URL, uniqID, video_name, video_size, video_duration] })
                .then((res) => {
                    if (res.err) {
                        ctx.reply('Something went wrong !!');
                        return console.log('errr', err);
                    }
                    ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
                    ctx.telegram.sendAnimation(ctx.chat.id, 'https://telegra.ph/file/b23b9e5ed1107e8cfae09.mp4',
                        {
                            caption: func.getCaption(response.data.shortenedUrl, 'https://t.me/joinchat/ojOOaC4tqkU5MTVl', true),
                            parse_mode: 'markdown'
                        }
                    );
                })
                .catch(err => {
                    ctx.reply(`error===${err}`);
                });
        }
    } else {
        ctx.reply('Please send a valid link to be shorten !!!')
    }
});

/*

FFMPEG

*/

function showProgress(received, total){
    let percentage = (received * 100) / total;
    return Number(percentage).toFixed(2) + "% | " + func.formatBytes(received) + " out of " + func.formatBytes(total) + " ."
};

async function downloadImage(url, path, ctx) {
    let received_bytes = 0;
    let total_bytes = 0;
    let progress = 'downloading';
    
    const writer = fs.createWriteStream(path);
    
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(writer);
    total_bytes = parseInt(response.headers['content-length']);
    
    response.data.on('data', function (chunk) {
        // Update the received bytes
        received_bytes += chunk.length;
        progress = showProgress(received_bytes, total_bytes);
    });
    
    let downloadTimer = setInterval(function () {
        if (received_bytes > 0 && total_bytes > 0 && received_bytes == total_bytes) {
            clearInterval(downloadTimer);
        }
        const download_complete_msg = 'Downloading is completed ...\n\nNow getting ready to generate screenshots !!'
        const msg = progress.includes('100') ? download_complete_msg : progress;
        ctx.telegram.editMessageText(ctx.chat.id, ctx.message.message_id + 1, '', msg);
    }, 2000);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    });
};

bot.command('ffmpeg', async (ctx) => {
    const URL = ctx.message.text.split(' ')[1];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const shortURL = URL.match(urlRegex);
    
    if (shortURL === null) return ctx.reply('Send valid link to generate screenshots !!');
    
    await ctx.reply('Downloading file to my server !!');
    
    if(!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
    };
    const localFilePath = "./uploads/Hello.mp4"
    let myScreenshots = [];
    console.log('file-is-going-to-be-saved', localFilePath);
    await downloadImage(shortURL[0], localFilePath, ctx);
    console.log('file-is-saved');

    if(!fs.existsSync('./uploads/Hello.mp4')) console.log('not-existed');

    try {
        ffmpeg('./uploads/Hello.mp4')
        .on('filenames', function(filenames) {
            myScreenshots = filenames;
         })
        .on('end', async function() {
            console.log('Screenshots taken');
            ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id + 1);
            const media = myScreenshots.map(ss => {
                return {
                    type: 'photo',
                    media: { source : path.join(__dirname + `/downloads/${ss}`)},
                    caption: ss
                }
            });
            await ctx.telegram.sendMediaGroup(ctx.chat.id, media);
         })
        .on('error', function(err) {
            console.error(err);
         })
        .screenshots({
            count: process.env.SCREENSHOTS_COUNT,
            folder: './downloads/'
        });
    }
    catch (error){
        console.log('try-catch-error',error)
    }  
});

bot.launch();
