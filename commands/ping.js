const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Показывает задержку API.'),

  async execute(interaction) {
    const startDiscordAPI = Date.now();
    await axios.get('https://discord.com/api/v9/gateway');
    const endDiscordAPI = Date.now();
    const latencyDiscordAPI = endDiscordAPI - startDiscordAPI;

    const startOpenAIAPI = Date.now();
    await axios.get('https://status.openai.com/api/v2/status.json');
    const endOpenAIAPI = Date.now();
    const latencyOpenAIAPI = endOpenAIAPI - startOpenAIAPI;

    const embed = new EmbedBuilder()
      .setColor('#36393f')
      .setTitle('Задержка API')
      .setDescription('С помощью этой команды вы можете проверить скорость обмена данными между ботом и серверами Discord и OpenAI.')
      .setThumbnail('https://cdn.discordapp.com/attachments/1107383415826817165/1107392565185101844/ping.png')
      .addFields(
        { name: '> **Discord**', value: `\`\`\`yaml\n 		${latencyDiscordAPI}ms\`\`\``, inline: true },
        { name: '> **OpenAI**', value: `\`\`\`yaml\n 		${latencyOpenAIAPI}ms\`\`\``, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
