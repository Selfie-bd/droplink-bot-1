require('dotenv').config();

const isAdmin = (ctx) => {
    const fromId = getFromId(ctx)
    if (!fromId || process.env.SUDO_USERS != fromId) return { success: false , error: '⚠️  This command is Admin only !!!'}
    else return { success: true }
};

const getFromId = (ctx) => {
    if (ctx.message) {
        return ctx.message.from.id
    } else if (ctx.callbackQuery) {
        return ctx.callbackQuery.from.id
    } else if (ctx.inlineQuery) {
        return ctx.inlineQuery.from.id
    } else {
        return null
    }
};
const sendReply = (ctx, results) => {
    if (results.error) {
        return ctx.reply(results.error.msg);
    }
    if (results.total > 0) {
        const res = results.data[0];
        ctx.reply(`*Showing results from DB*\n\n*ID :* \`${res.id}\`\n\n*Uniq ID :* \`${res.uniq_id}\`\n\n*Original URL :* \`${res.org_url}\`\n\n*Droplink :* \`${res.droplink}\`\n\n*Video Metadata *{\n      *Name :* \`${res.video_name}\`\n      *Size :*  \`${formatBytes(res.video_size)}\`\n      *Duration :*  \`${secondsToHms(res.video_duration)}\`\n}`, {
            parse_mode: 'markdown'
        });
    } else {
        ctx.reply('No results found !!');
    }
};
const secondsToHms = (value) => {
    const d = Number(value);
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);

    const hDisplay = h > 0 ? (h < 10 ? '0' + h : h) + (h == 1 ? " hour" : " hours") : "";
    const mDisplay = m > 0 ? (m < 10 ? '0' + m : m) + (m == 1 ? " minute" : " minutes") : "";
    const sDisplay = s > 0 ? (s < 10 ? '0' + s : s) + (s == 1 ? " second" : " seconds") : "";

    if (hDisplay && mDisplay && sDisplay) return hDisplay + ', ' + mDisplay + ', ' + sDisplay;
    if (hDisplay && mDisplay) return hDisplay + ', ' + mDisplay;
    if (hDisplay && sDisplay) return hDisplay + ', ' + sDisplay
    if (mDisplay && sDisplay) return mDisplay + ', ' + sDisplay;
    if (hDisplay) return hDisplay;
    if (mDisplay) return mDisplay;
    if (sDisplay) return sDisplay;
    return '00: 00 : 00';
};
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getCaption = (shortenLink, BACKUP_CHANNEL, isScreenshot=false) => {
    const DEF_CAPTION = '🔰  _HOW TO WATCH_ :\n\n➤  _Watch Video :_ [Download Trick](https://t.me/how_to_download_movie_official/4)\n➤  _Just Install PLAYit App from PlayStore_\n➤  🚀 _High Speed Download & No Buffering_\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📥 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐋𝐢𝐧𝐤𝐬/👀𝐖𝐚𝐭𝐜𝐡 𝐎𝐧𝐥𝐢𝐧𝐞\n\n\n';
    let URL_CAPTION = `❓️ _How To Download From *DROPLINK*_\n     (Droplink से वीडियो कैसे डाउनलोड करे) 👇🏻️\n➤ https://t.me/my\\_channels\\_list\\_official/4\n\n\n🎬 *Video Link*\n ➪ ${shortenLink}\n\n\n`;
    if (isScreenshot) URL_CAPTION = '🔞️ _Screenshots/Preview/Trailer_\n ➪ Replace\\_Link\n\n' + URL_CAPTION;
    const BACKUP_CAPTION = `💠 _Backup Channel_ :\n ➤ ${BACKUP_CHANNEL}\n\n♻️ _Other Channels_ :\n ➤ https://t.me/my\\_channels\\_list\\_official`;
    return DEF_CAPTION + URL_CAPTION + BACKUP_CAPTION;
};

module.exports = {
    isAdmin,
    sendReply,
    secondsToHms,
    formatBytes,
    getCaption
};
