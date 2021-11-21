const { Telegraf } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.BOT_TOKEN);

const axios = require('axios');

const path = require('path');
// const router = express.Router();

const express = require('express');
const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// app.use('/', router);

app.get('*', (req, res) => {
    // res.send('Bot is working now !!');
    console.log('req===', req.path)
    console.log('req.route.path', req.path.split('/')[1])
    res.render(path.join(__dirname+'/index.ejs'), {
        username: 'sagar'
    })
    // res.sendFile(path.join(__dirname+'/index.html'));
    // res.sendFile('index.html');
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

bot.on('text', async (ctx) => {
    console.log('ctx', ctx.message.text);

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const URL = ctx.message.text.match(urlRegex);
    console.log('url---', URL)

    if (URL.length) {
        const response = {
            data: {
                status: 'success',
                message: '',
                shortenedUrl: 'https://droplink.co/QHVc'
            }
        }
        // const response = await axios.get(`https://droplink.co/api?api=${process.env.DROPLINK_API_TOKEN}&url=${URL[0]}`);
        console.log('response', response)
        if (response.data.status === 'success') {
            ctx.reply(response.data.shortenedUrl);
        }
    }
});

bot.launch();