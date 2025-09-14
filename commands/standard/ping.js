const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Get the current status of Ruby'),
	async execute(interaction) {
		const user = global.client.user;
		const embed = new EmbedBuilder()
			.setAuthor({ 
				name: `${user.username}#${user.discriminator}`, 
				iconURL: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
			})
			.setDescription(`Uptime: ${global.format_time(process.uptime())}`)
			.addFields({
				name: 'Version',
				value: `${global.version}`
			}, {
				name: 'API Ping',
				value: `${Math.round(global.client.ws.ping)}ms`
			})
			.setColor(global.color);
		let sent = await interaction.reply({ embeds: [embed] });
		embed.addFields({
			name: 'Roundtrip Ping',
			value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`
		})
		interaction.editReply({ embeds: [embed] });
	},
};