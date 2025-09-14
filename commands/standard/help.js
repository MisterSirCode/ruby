const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('List all usable commands'),
	async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(`${global.client.user.username}\'s Commands`)
			.setColor(global.color);
			global.client.commands.forEach((command) => {
				if (!command.EXCLUDE) {
                    embed.addFields({
                        name: '/' + command.data.name, 
                        value: command.data.description, 
                        inline: true
                    });
                }
			});
		await interaction.reply({ embeds: [embed] });
	},
};