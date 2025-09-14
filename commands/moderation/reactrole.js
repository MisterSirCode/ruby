const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

function assignReactionRole(role, message, Emote) {
    message.react(emote);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reactrole')
		.setDescription('Setup or disable reaction roles')
        .addSubcommand(command => command
            .setName('add')
            .setDescription('Add new reaction role')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('Choose a role to add'))
            .addStringOption(option => option
                .setName('message')
                .setDescription('Message ID to append to'))
            .addStringOption(option => option
                .setName('emote')
                .setDescription('Emote to react to - Bot must have access to it')))
        .addSubcommand(command => command
            .setName('list')
            .setDescription('List reaction roles for a message')
            .addStringOption(option => option
                .setName('message')
                .setDescription('Message ID to check')))
        .addSubcommand(command => command
            .setName('remove')
            .setDescription('Remove reaction role from a message')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('Choose the role to remove'))
            .addStringOption(option => option
                .setName('message')
                .setDescription('Message ID to remove from')))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    EXCLUDE: true,
    LOCAL: true,
	async execute(interaction) {
        const embed = new EmbedBuilder();
        let ops = interaction.options;
        let fail = false;
        if (ops.getSubcommand() == 'add') {
            let role = ops.getRole('role');
            let message = ops.getString('message');
            let emote = ops.getString('emote');
            let channel = interaction.channel;
            let guild = interaction.guild;
            channel.messages.fetch(message).then(async vermsg => {
                if (emote.length > 14 && emote.length < 20)
                    guild.emojis.fetch(emote).then(async veremt => {
                        assignReactionRole(role, vermsg, emote);
                        await interaction.reply({ content: `Assigned reaction role`, flags: MessageFlags.Ephemeral });
                    }).catch(async () => {
                        await interaction.reply({ content: 'Emote doesnt exist or bot does not have access to it' });
                    });
                else if (emote.length == 2) {
                    assignReactionRole(role, vermsg, emote);
                    await interaction.reply({ content: `Assigned reaction role`, flags: MessageFlags.Ephemeral });
                } else await interaction.reply({ content: 'Emote doesnt exist or is not recognized' });
            }).catch(async () => {
                await interaction.reply({ content: 'Message doesnt exist or not in current channel' });
            });
        } else if (ops.getSubcommand() == 'list') {

        } else if (ops.getSubcommand() == 'remove') {

        }
	},
};