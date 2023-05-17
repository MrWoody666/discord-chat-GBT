const { Events } = require('discord.js');
const color = require('../utils/logger');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()){
            return;
        } 
        

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			color.error(`Команда, соответствующая ${interaction.commandName}, не найдена.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			color.error(`Ошибка при выполнении ${interaction.commandName}.`);
			color.error(error);
		}
	},
};