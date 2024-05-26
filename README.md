# telegram2whatsapp

This is a simple bot that forwards messages from a Telegram group to a WhatsApp group.

## How to use it

1. Create a Telegram bot and get the token. You can follow the instructions [here](https://core.telegram.org/bots#6-botfather).
2. Create a WhatsApp group and get the group ID. You can follow the instructions [here](https://faq.whatsapp.com/general/chats/how-to-find-the-group-link-or-id).
3. Edit the example.env file with the following information:
    - BOT_TOKEN=get from bot father
    - CHANNEL1_ID=channel from msg to fetch
    - CHANNEL2_ID=channel to store msg
    - ADMIN=admin whatsapp id 
    - GROUPS=groups id in a string

4. Rename the example.env file to .env.
5. Run the following commands:
    ```bash
    npm install
    npm start
    ```

## How it works

The bot will fetch the messages from the Telegram group and send them to the WhatsApp group. It will also send the media files (photos, videos, documents, etc.) and the replies to the messages.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing to telegram2whatsapp

To contribute to telegram2whatsapp, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin telegram2whatsapp/<location>`
5. Create the pull request.
6. Alternatively, see the GitHub documentation on creating a pull request.
7. Wait for the maintainers to review your PR.
8. Make sure your changes do not break the code.

## Special Thanks

- Telegraf.js
- WhiskySocket/Baileys

## Disclaimer

This project is not affiliated with Telegram or WhatsApp. It is an unofficial project created for educational purposes.

Any action you take upon the information on this repository is strictly at your own risk. We will not be liable for any losses and damages in connection with the use of this repository.

Enjoy the bot! 🚀