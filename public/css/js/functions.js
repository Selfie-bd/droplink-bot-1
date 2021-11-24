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
        ctx.reply(`*Showing results from DB*\n\n*ID :* \`${res.id}\`\n\n*Uniq ID :* \`${res.uniq_id}\`\n\n*Original URL :* \`${res.org_url}\`\n\n*Droplink :* \`${res.droplink}\``, {
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

module.exports = {
    isAdmin,
    sendReply,
    secondsToHms,
    formatBytes
};
