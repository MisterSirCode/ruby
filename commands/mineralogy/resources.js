const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resources')
		.setDescription('Get some useful links and information about mineralogy'),
	async execute(interaction) {
		const content = global.rubydb.get('commands.resource.content');
        const embed = new EmbedBuilder()
            .setTitle(`Mineralogy Resources`)
			.setColor(global.color)
			.setDescription(content.replaceAll("\\n", "\n"));
		await interaction.reply({ embeds: [embed] });
	},
};