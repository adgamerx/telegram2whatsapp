const {
  makeWASocket,
  DisconnectReason,
  BufferJSON,
  useMultiFileAuthState,
  Browsers,
} = require("@whiskeysockets/baileys");

require("dotenv").config(); // Load environment variables from .env file

const admin = process.env.ADMIN; // The admin's phone number

var groupIDs = process.env.GROUPS.split(" "); // The group IDs

async function connectToWhatsApp() {
  // load the auth info from file
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  // create a new socket
  const sock = makeWASocket({
    printQRInTerminal: true,
    qrTimeout: 0, // 0 means it will never time out
    auth: state,
    version: [2, 2413, 1],
    logconsole: false,
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
    if (messages[0].key.fromMe) return; // ignore messages from self
    // if (messages[0].key.remoteJid != admin) return; // ignore messages from other numbers

    console.log(messages);

    // Test if the bot is working
    if (messages[0].message.conversation === "test") {
      await sock.sendMessage(messages[0].key.remoteJid, {
        text: "Bot is working!🎉",
      });
      return;
    }

    // Broadcast messages to the groups
    if (messages[0].message.conversation) {
      groupIDs.forEach(async (groupID) => {
        await sock.sendMessage(groupID, {
          text: messages[0].message.conversation,
        });

        // Add delay to prevent rate limiting
        await delay(2000);
      });
    }
  });
}

// Function to introduce delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// run in main file
connectToWhatsApp();
