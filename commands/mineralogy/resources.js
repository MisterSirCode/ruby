const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resources')
		.setDescription('Get some useful links and information about mineralogy'),
	async execute(interaction) {
		const content = global.rubydb.get('commands.resource.content');
        const helpEmbed = new EmbedBuilder()
            .setTitle(`Mineralogy Resources`)
			.setColor(global.color)
			.setDescription(content);
		await interaction.reply({ embeds: [helpEmbed] });
	},
};