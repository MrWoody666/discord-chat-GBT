require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const color = require('./src/utils/logger');

const commands = [];

// Функция для получения списка файлов всех команд в указанной папке (включая подпапки)
function getCommandFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      const subDir = `${dir}/${file.name}`;
      getCommandFiles(subDir);
    } else if (file.name.endsWith('.js')) {
      commands.push(require(`${dir}/${file.name}`).data.toJSON());
    }
  }
}

// Получаем все файлы команд из папки 'commands' (включая подпапки)
getCommandFiles('./src/commands');

// Создаем экземпляр REST для взаимодействия с Discord API
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

// Функция для развертывания команд
async function deployCommands() {
  try {
    color.info('Начинаю обновление глобальных команд приложения.');

    // Отправляем данные команд в API Discord для обновления глобальных команд
    const data = await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), {
      body: commands
    });

    color.success(`Успешно обновлено ${data.length} глобальных команд приложения.`);
  } catch (error) {
    color.error(error);
  }
}

// Вызываем функцию для развертывания команд
deployCommands();