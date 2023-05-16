const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('fs');

const commands = [];

// Получаем все файлы команд из папки 'commands'
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Получаем данные каждой команды для развертывания
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

// Создаем экземпляр REST для взаимодействия с Discord API
const rest = new REST({ version: '10' }).setToken(token);

// Функция для развертывания команд
async function deployCommands() {
  try {
    console.log('Начинаю обновление глобальных команд приложения.');

    // Отправляем данные команд в API Discord для обновления глобальных команд
    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commands
    });

    console.log(`Успешно обновлено ${data.length} глобальных команд приложения.`);
  } catch (error) {
    console.error(error);
  }
}

// Вызываем функцию для развертывания команд
deployCommands();
