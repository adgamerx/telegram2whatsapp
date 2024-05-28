const {
    makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    Browsers,
  } = require("@whiskeysockets/baileys");
  const pino = require("pino");
  require("dotenv").config();
  const fetch = require("node-fetch");
  const fs = require("fs");
  const { Telegraf } = require("telegraf");
  
  const admin = process.env.ADMIN;
  const groupIDs = process.env.GROUPS.split(" ");
    const CHANNEL1_ID = process.env.CHANNEL1_ID;
//   const CHANNEL1_ID = -100;
  const CHANNEL2_ID = process.env.CHANNEL2_ID;
  const bot = new Telegraf(process.env.BOT_TOKEN);
  
  let sock;
  
  const connectToWhatsApp = async () => {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  
    sock = makeWASocket({
      printQRInTerminal: true,
    //   qrTimeout: 0,
      auth: state,
      version: [2, 2413, 1],
      logger: pino({ level: "silent" }),
    //   browser: Browsers.windows("desktop"),
    });
  
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        console.log("QR Code: ", qr); 
      }
      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log(
          "connection closed due to ",
          lastDisconnect.error,
          ", reconnecting ",
          shouldReconnect
        );
        if (shouldReconnect) {
          connectToWhatsApp();
        }
      } else if (connection === "open") {
        console.log("opened connection");
      }
    });
  
    sock.ev.on("creds.update", saveCreds);
  
    sock.ev.on("messages.upsert", async ({ messages }) => {
      console.log(messages);
      if (messages[0].key.fromMe) return;
      if (messages[0].key.remoteJid !== admin) return;
  
      if (messages[0].message.conversation === "test") {
        await sock.sendMessage(messages[0].key.remoteJid, {
          text: "Bot is working!🎉",
        });
        return;
      } else if (messages[0].message.conversation) {
        for (const groupID of groupIDs) {
          await sock.sendMessage(groupID, {
            text: messages[0].message.conversation,
          });
          await delay(2000);
        }
      }
    });
  
    return sock;
  };
  
  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  const sendMessageToWhatsApp = async (message) => {
    if (message.text) {
      for (const groupID of groupIDs) {
        await sock.sendMessage(groupID, {
          text: message.text,
        });
        await delay(1000);
      }
    } else if (message.photo) {
      for (const groupID of groupIDs) {
        const buffer = await fetch(message.fileLink.href).then((res) =>
          res.buffer()
        );
        await sock.sendMessage(groupID, {
          caption: message.caption || "",
          image: buffer,
        });
        await delay(1000);
      }
    }
  };
  
  connectToWhatsApp()
    .then((sock) => {
      console.log("Bot is running...");
  
      bot.command("start", (ctx) => {
        ctx.reply("Bot is running...");
      });
  
      bot.command("help", (ctx) => {
        ctx.reply("This bot forwards messages from one channel to another.");
      });
  
      bot.on("channel_post", async (ctx) => {
        if (ctx.channelPost.chat.id == CHANNEL1_ID) {
          const message = ctx.channelPost;
  
          if (message.text) {
            ctx.telegram.sendMessage(CHANNEL2_ID, message.text);
            await sendMessageToWhatsApp({ text: message.text });
          } else if (message.photo) {
            const photo = message.photo[message.photo.length - 1].file_id;
            const fileLink = await ctx.telegram.getFileLink(photo);
            const caption = message.caption || "";
            ctx.telegram.sendPhoto(CHANNEL2_ID, photo, { caption });
            await sendMessageToWhatsApp({ photo: true, fileLink, caption });
          } else if (message.video) {
            const video = message.video.file_id;
            const caption = message.caption || "";
            ctx.telegram.sendVideo(CHANNEL2_ID, video, { caption });
          } else if (message.document) {
            const document = message.document.file_id;
            const caption = message.caption || "";
            ctx.telegram.sendDocument(CHANNEL2_ID, document, { caption });
          }
          // Handle other types of messages similarly (audio, voice, etc.)
        }
      });
  
      bot.launch();
  
      process.once("SIGINT", () => bot.stop("SIGINT"));
      process.once("SIGTERM", () => bot.stop("SIGTERM"));
    })
    .catch((err) => {
      console.error("Failed to connect to WhatsApp:", err);
    });
  