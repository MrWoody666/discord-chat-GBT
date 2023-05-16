const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute() {
    try {
      console.info(`Бот успешно запущен!`);
    } catch (error) {
      console.error(`Ошибка при запуске бота: ${error}`);
    }
  },
};
