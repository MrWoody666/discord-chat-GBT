const { Events } = require('discord.js');
const color = require('../utils/logger');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute() {
    try {
      color.success(`Бот успешно запущен!`);
    } catch (error) {
        color.warn(`Ошибка при запуске бота: ${error}`);
    }
  },
};