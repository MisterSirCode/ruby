const { EmbedBuilder, SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setresources')
		.setDescription('Set the information for the /resources command')
		.addStringOption(option => option
			.setName('content')
			.setDescription('Raw content to be posted')
			.setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction) {
        const option = interaction.options.getString('content');
		global.rubydb.set('commands.resource.content', option || '');
        const helpEmbed = new EmbedBuilder()
            .setTitle(`Set Resource Command`)
			.setColor(global.color)
			.setDescription(option);
		await interaction.reply({ embeds: [helpEmbed] });
	},
};