const {
  makeWASocket,
  DisconnectReason,
  BufferJSON,
  useMultiFileAuthState,
  Browsers,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
require("dotenv").config(); // Load environment variables from .env file

const admin = process.env.ADMIN; // The admin's phone number
var groupIDs = process.env.GROUPS.split(" "); // The group IDs

let sock;

const connectToWhatsApp = async () => {
  // load the auth info from file
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  // create a new socket
  sock = makeWASocket({
    printQRInTerminal: true,
    qrTimeout: 0, // 0 means it will never time out
    auth: state,
    version: [2, 2413, 1],
    logger: pino({ level: "silent" }),
    browser: Browsers.windows("desktop"),
  });

  // connect to WA
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(
        "connection closed due to ",
        lastDisconnect.error,
        ", reconnecting ",
        shouldReconnect
      );
      // reconnect if not logged out
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === "open") {
      console.log("opened connection");
    }
  });

  // save creds on update
  sock.ev.on("creds.update", saveCreds);

  // listen for messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    console.log(messages);
    if (messages[0].key.fromMe) return; // ignore messages from self
    if (messages[0].key.remoteJid != admin) return; // ignore messages from other numbers


    // Test if the bot is working
    if (messages[0].message.conversation == "test") {
      await sock.sendMessage(messages[0].key.remoteJid, {
        text: "Bot is working!🎉",
      });
      return;
    } else if (messages[0].message.conversation) {
      groupIDs.forEach(async (groupID) => {
        await sock.sendMessage(groupID, {
          text: messages[0].message.conversation,
        });

        // Add delay to prevent rate limiting
        await delay(2000);
      });
    }
  });

  return sock;
};

// Function to introduce delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const sendMessageToWhatsApp = async (message) => {
  // Broadcast messages to the groups
  if (message.text) {
    groupIDs.forEach(async (groupID) => {
      await sock.sendMessage(groupID, {
        text: message.text,
      });
      await delay(2000);
    });
  } else if (message.photo) {
    groupIDs.forEach(async (groupID) => {
      await sock.sendMessage(groupID, {
        text: message.caption,
        attachment: message.photo,
      });
      await delay(2000);
    });
  };
};

// run in main file
sock = connectToWhatsApp();

module.exports = { sock, sendMessageToWhatsApp };
