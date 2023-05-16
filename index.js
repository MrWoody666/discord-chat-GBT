require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const { Configuration, OpenAIApi } = require("openai");
const { OPENAI_API_KEY } = require('./config.json');

const configuration = new Configuration({
	apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = { openai };

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath, { withFileTypes: true });

for (const file of commandFiles) {
	if (file.isDirectory() || !file.name.endsWith('.js')) continue;
	const filePath = path.join(commandsPath, file.name);
	const command = require(filePath);

	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] В команде по адресу ${filePath} отсутствует необходимое свойство "data" или "execute".`);
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for(const file of eventFiles){
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else{
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on('error', async (err) => {
	console.clear();
	console.error(`[ERROR] Произошла критическая ошибка: ${err}`);
	console.error('[INFO] Перезапуск бота...');
	console.log('[SUCCESS] Бот успешно перезапущен!');
	Promise.resolve(client.destroy()).then(() => {
	  client.login(token);
	});
  });

client.login(token);
