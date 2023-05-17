require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders');
const { spawn } = require('child_process');
const colors = require('colors/safe');
const color = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Перезапускает бота.'),

  async execute(interaction) {
    try {
      // Проверяем, является ли пользователь администратором
      if (interaction.user.id !== process.env.CREATOR_ID) {
        return interaction.reply({
          content: 'У вас нет доступа к этой команде.',
          ephemeral: true,
        });
      }

      console.clear();
      const reply = await interaction.reply({
        content: 'Начинаем перезапуск бота...',
        ephemeral: true,
      });

      // Запускаем скрипт перезапуска бота
      const child = spawn('node', ['index.js']);

      // Логгируем ошибки
      child.stderr.on('data', (data) => {
        color.error(`${data}`);
      });

      // Логгируем вывод процесса
      child.stdout.on('data', (data) => {
        console.log(`${colors.bgMagenta('[RELOAD]')} ―${data}`);
        if (data.toString().includes('Бот успешно запущен!')) {
          reply.edit('Бот успешно перезапущен!');
        } else {
          reply.edit(`В процессе перезапуска...`);
        }
      });

      // Обработка завершения процесса
      child.on('exit', (code) => {
        if (code === 0) {
          color.info('Процесс перезапуска завершен успешно');
          reply.edit('Бот успешно перезапущен!');
        } else {
          color.error(`Произошла ошибка при перезапуске бота (код завершения ${code})`);
          reply.edit('Произошла ошибка при перезапуске бота.');
        }
      });

    } catch (error) {
      color.error(error);
      await interaction.reply({
        content: 'Произошла ошибка при перезапуске бота.',
        ephemeral: true,
      });
    }
  },
};
