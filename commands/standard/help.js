const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('List all usable commands'),
	async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setTitle(`${global.client.user.username}\'s Commands`)
			.setColor(global.color);
			global.commands.forEach((command) => {
				if (command.EXCLUDE) return;
				helpEmbed.addFields({
					name: '/' + command.name, 
					value: command.description, 
					inline: true
				});
			});
		await interaction.reply({ embeds: [helpEmbed], flags: MessageFlags.Ephemeral });
	},
};