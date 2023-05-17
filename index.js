require('dotenv').config(); // Загрузка переменных среды из .env файла
const { Client, GatewayIntentBits, Collection } = require('discord.js'); // Подключение Discord.js
const fs = require('node:fs'); // Подключение модуля fs для работы с файловой системой
const path = require('node:path'); // Подключение модуля path для работы с путями к файлам
const color = require('./src/utils/logger'); // Подключение логгера

const { Configuration, OpenAIApi } = require("openai"); // Подключение OpenAI API

// Создание экземпляра OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API,
});
const openai = new OpenAIApi(configuration);

module.exports = { openai };

// Создание экземпляра клиента Discord
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.MessageContent] });

client.commands = new Collection(); // Создание коллекции команд
const commandsPath = path.join(__dirname, '.', 'src', 'commands'); // Путь к папке с командами

// Рекурсивная функция для загрузки команд из папки и её подпапок
const loadCommands = (dir) => {
  const files = fs.readdirSync(dir, { withFileTypes: true }); // Получение списка файлов и папок в текущей папке

  for (const file of files) {
    if (file.isDirectory()) {
      const subDir = path.join(dir, file.name);
      loadCommands(subDir); // Рекурсивный вызов функции для подпапки
    } else if (file.name.endsWith('.js')) {
      const command = require(path.join(dir, file.name));
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command); // Добавление команды в коллекцию команд
        color.info(`Загружена команда: ${command.data.name}.`);
      } else {
        color.error(`Файл команды ${path.join(dir, file.name)} не был загружен, так как отсутствует одно из свойств "data" или "execute".`);
      }
    }
  }
};

loadCommands(commandsPath); // Загрузка команд
color.success("Все команды загружены.");

// Рекурсивная функция для загрузки событий из папки и её подпапок
const eventsPath = path.join(__dirname, '.', 'src', 'events'); // Путь к папке с событиями
// Функция для загрузки событий
function loadEvents(client, dir) {
  // Получаем все файлы событий из указанной директории
  const eventFiles = fs.readdirSync(dir);

  // Проходимся по каждому файлу и загружаем события
  for (const file of eventFiles) {
    // Получаем полный путь до файла события
    const filePath = path.join(dir, file);

    try {
      // Получаем информацию о файле
      const stat = fs.lstatSync(filePath);

      // Если файл является директорией, загружаем события из подпапки рекурсивно
      if (stat.isDirectory()) {
        loadEvents(client, filePath);
      } 
      // Если файл является JavaScript-файлом события
      else if (file.endsWith('.js')) {
        // Загружаем объект события
        const event = require(filePath);
        // Если событие должно быть выполнено только один раз, добавляем обработчик "once"
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args));
        } 
        // Иначе добавляем обработчик "on"
        else {
          client.on(event.name, (...args) => event.execute(...args));
        }
        // Выводим сообщение об успешной загрузке события в консоль
        color.info(`Загружено событие: ${file}.`);

        // Если у объекта события есть свойство events, загружаем их рекурсивно
        if (event.events) {
          loadEvents(client, path.join(dir, event.events));
        }
      }
    } catch (err) {
      color.error(`Ошибка при загрузке файла ${filePath}. ${err.message}`);
    }
  }
}

// Загружаем все события из указанной директории
loadEvents(client, eventsPath);
color.success("Все события загружены.");

// Авторизуем бота с помощью токена
client.login(process.env.BOT_TOKEN);