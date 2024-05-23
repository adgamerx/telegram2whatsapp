require('dotenv').config(); // Load environment variables from .env file
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN); // Use the BOT_TOKEN environment variable

// Channel IDs  (Use the CHANNEL_ID environment variables)
const CHANNEL1_ID = process.env.CHANNEL1_ID;
const CHANNEL2_ID = process.env.CHANNEL2_ID; 

// Log that the bot is running
console.log("Bot is running...");

// Handle messages in channel1
bot.on('channel_post', (ctx) => {
  if (ctx.channelPost.chat.username === CHANNEL1_ID) {
    const message = ctx.channelPost;

    if (message.text) {
      // If the message is text
      ctx.telegram.sendMessage(CHANNEL2_ID, message.text);
    } else if (message.photo) {
      // If the message is a photo
      const photo = message.photo[message.photo.length - 1].file_id;
      const caption = message.caption || '';
      ctx.telegram.sendPhoto(CHANNEL2_ID, photo, { caption });
    } else if (message.video) {
      // If the message is a video
      const video = message.video.file_id;
      const caption = message.caption || '';
      ctx.telegram.sendVideo(CHANNEL2_ID, video, { caption });
    } else if (message.document) {
      // If the message is a document
      const document = message.document.file_id;
      const caption = message.caption || '';
      ctx.telegram.sendDocument(CHANNEL2_ID, document, { caption });
    }
    // Handle other types of messages similarly (audio, voice, etc.)
  }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
