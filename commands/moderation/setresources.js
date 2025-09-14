const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setresources')
		.setDescription('Set the information for the /resources command')
		.addBooleanOption(option => option
			.setName('acquire')
			.setDescription('Return the raw content of the current resources')
			.setRequired(false))
		.addStringOption(option => option
			.setName('content')
			.setDescription('Raw content to be posted')
			.setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	EXCLUDE: true,
	async execute(interaction) {
        const embed = new EmbedBuilder();
        const content = interaction.options.getString('content');
        const acquire = interaction.options.getBoolean('acquire');
		if (acquire) {
			embed.setTitle(`Current Resources (Raw)`)
				.setColor(global.color)
				.setDescription(`\`\`\`${global.rubydb.get('commands.resource.content')}\`\`\``);
		} else {
			global.rubydb.set('commands.resource.content', content || '');
			embed.setTitle(`Set Resource Command`)
				.setColor(global.color)
				.setDescription(content);
		}
		await interaction.reply({ embeds: [embed] });
	},
};