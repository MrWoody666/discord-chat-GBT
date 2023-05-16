const { SlashCommandBuilder } = require('@discordjs/builders');
const { user_id } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Позволяет боту повторить ваше сообщение')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Сообщение, которое нужно повторить')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Пользователь, которому нужно отправить сообщение')
        .setRequired(false)
    )
    .addBooleanOption(option =>
      option.setName('private')
        .setDescription('Отправить сообщение в личные сообщения пользователя')
        .setRequired(false)
    ),
  async execute(interaction) {
    const text = interaction.options.getString('text');
    const shouldSendPrivately = interaction.options.getBoolean('private') ?? false;
    const targetUser = interaction.options.getUser('user');
    const userId = interaction.user.id;

    // Проверяем, является ли пользователь разрешенным
    if (userId !== user_id) {
      await interaction.reply({ content: 'У вас нет доступа к этой команде.', ephemeral: true });
      return;
    }

    // Определяем, куда нужно отправить сообщение
    let message;
    let sentMessage;
    if (shouldSendPrivately && targetUser) {
      let dmChannel;
      try {
        dmChannel = await targetUser.createDM();
      } catch (error) {
        await interaction.reply({ content: `Не удалось отправить сообщение пользователю ${targetUser}. Чат для личных сообщений закрыт.`, ephemeral: true });
        return;
      }
      message = await interaction.reply({ content: `Сообщение отправлено пользователю ${targetUser}`, ephemeral: true });
      sentMessage = await dmChannel.send(text);
    } else if (shouldSendPrivately) {
      let dmChannel;
      try {
        dmChannel = await interaction.user.createDM();
      } catch (error) {
        await interaction.reply({ content: 'Не удалось отправить сообщение вам. Чат для личных сообщений закрыт.', ephemeral: true });
        return;
      }
      message = await interaction.reply({ content: text, ephemeral: true });
      sentMessage = await dmChannel.send(text);
    } else if (targetUser) {
      message = await interaction.reply({ content: `Сообщение отправлено в чат для ${targetUser}`, ephemeral: true });
      sentMessage = await interaction.channel.send(`<@${targetUser.id}>: ${text}`);
    } else {
      message = await interaction.reply({ content: text, ephemeral: true });
      sentMessage = await interaction.channel.send(text);
    }

    // Удаляем эфимерное сообщение
    if (interaction.replied) {
      setTimeout(async () => {
        try {
          await message.delete();
        } catch (error) {
          console.error(`Не удалось удалить сообщение: ${error}`);
        }
      }, 2000);
    }

  },
};
