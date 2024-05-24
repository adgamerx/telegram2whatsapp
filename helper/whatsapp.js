const {
  makeWASocket,
  DisconnectReason,
  BufferJSON,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");

async function connectToWhatsApp() {
  // load the auth info from file
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  // create a new socket
  const sock = makeWASocket({
    printQRInTerminal: true,
    qrTimeout: 0, // 0 means it will never time out
    auth: state,
    logconsole: false,
    version: [2, 2413, 1],
    syncFullHistory: false,
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

    if(messages[0].key.fromMe) return; // ignore messages from self

    console.log("got messages", messages[0].message.conversation);
    // reply to the message
    await sock.sendMessage(messages[0].key.remoteJid, {
      text: "Hello there!",
    });
  });
}
// run in main file
connectToWhatsApp();
