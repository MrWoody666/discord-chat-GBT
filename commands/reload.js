const { SlashCommandBuilder } = require('@discordjs/builders');
const { user_id } = require('../config.json');
const { spawn } = require('child_process');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Перезапускает бота.'),
  async execute(interaction) {
    try {
      // Проверяем, является ли пользователь администратором
      if (interaction.user.id !== user_id) {
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
        console.error(`[RELOAD]: ${data}`);
      });

      // Логгируем вывод процесса
      child.stdout.on('data', (data) => {
        console.log(`[RELOAD]: ${data}`);
        if (data.toString().includes('Бот успешно запущен!')) {
          reply.edit({
            content: 'Бот успешно перезапущен!',
            ephemeral: true,
          });
        } else {
          reply.edit({
            content: `Загрузка... \n\`\`\`${data}\`\`\``,
            ephemeral: true,
          });
        }
      });

      // Обработка завершения процесса
      child.on('exit', (code) => {
        console.log(`Процесс перезапуска завершен с кодом ${code}`);
      });

    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Произошла ошибка при перезапуске бота.',
        ephemeral: true,
      });
    }
  },
};
