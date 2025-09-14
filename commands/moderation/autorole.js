const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('autorole')
		.setDescription('Setup or disable the automatic join role')
        .addSubcommand(command => command
            .setName('set')
            .setDescription('Set the role to be given upon joining')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('Choose a role to add')))
        .addSubcommand(command => command
            .setName('disable')
            .setDescription('Disable autorole'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    EXCLUDE: true,
	async execute(interaction) {
        const embed = new EmbedBuilder();
        let ops = interaction.options;
        let guild = interaction.guild;
        if (ops.getSubcommand() == 'set') {
            let role = ops.getRole('role');
            global.rubydb.set(`guilds.${guild.id}.autorole`, role.id);
            await interaction.reply({ content: `Enabled autorole`, flags: MessageFlags.Ephemeral });
        } else if (ops.getSubcommand() == 'disable') {
            if (global.rubydb.has(`guilds.${guild.id}.autorole`)) 
                global.rubydb.delete(`guilds.${guild.id}.autorole`);
            await interaction.reply({ content: `Disabled autorole`, flags: MessageFlags.Ephemeral });
        }
	},
};