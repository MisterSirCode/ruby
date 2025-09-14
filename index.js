require('dotenv').config();
const { FSDB } = require('file-system-db');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, REST, Routes, Partials, EmbedBuilder } = require('discord.js');
const { default: chalk } = require('chalk');
const packge = require('./package.json');
const config = require('./config.json');
const mindat = require('./mindat.json');
const path = require('path');
const rest = new REST({ version: '10' }).setToken(process.env.RUBYPASS);
const fs = require('fs');


// Initialization
global.version = packge.version;
global.color = config.color;
global.mindat = mindat;
global.rubydb = new FSDB();
global.client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions ], partials: [
    Partials.Message, 
    Partials.Channel, 
    Partials.Reaction,
    Partials.User
]});
global.client.once(Events.ClientReady, client => {
    console.clear();
    // https://budavariam.github.io/asciiart-text/ - ANSI Shadow
    console.log(chalk.redBright(`
 ██████╗ ██╗   ██╗██████╗ ██╗   ██╗ 
 ██╔══██╗██║   ██║██╔══██╗╚██╗ ██╔╝
 ██████╔╝██║   ██║██████╔╝ ╚████╔╝ 
 ██╔══██╗██║   ██║██╔══██╗  ╚██╔╝  
 ██║  ██║╚██████╔╝██████╔╝   ██║   
 ╚═╝  ╚═╝ ╚═════╝ ╚═════╝    ╚═╝ V${packge.version}
    `))
	console.log(chalk.red(` > Ruby Initialized - Logged in as ${client.user.tag}`));
});

// Formatter for converting seconds to a refined time string (HH:MM:SS)
global.format_time = (seconds) => {
    function pad(s) {
        return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(seconds / (60 * 60));
    var minutes = Math.floor(seconds % (60 * 60) / 60);
    var seconds = Math.floor(seconds % 60);
    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}

// Handle Commands
global.local_commands = [];
global.commands = [];
global.client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);
commandFolders.forEach((folder) => {
    const categoryPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    commandFiles.forEach((file) => {
        const filePath = path.join(categoryPath, file);
        const command = require(filePath);
        try {
            if ('data' in command && 'execute' in command) {
                global.client.commands.set(command.data.name, command);
                global.local_commands.push(command.data.toJSON());
                if (command.LOCAL)
                    global.commands.push(command.data.toJSON());
            } else
                console.log(`Command at ${filePath} is not configured correctly`);
        } catch(e) {
            console.log(e);
        }
    });
});

// Handle Command Execution
global.client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) { }
    else {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) { return; }
        try {
            await command.execute(interaction);
        } catch(e) {
            console.log(e);
            await interaction.reply({ content: 'There was an error executing the command', flags: MessageFlags.Ephemeral })
        }
    }
});

// Handler for developer-only commands
global.client.on(Events.MessageCreate, async message => {
    const txt = message.content;
    if (message.author.id === config.owner) {
        let botname = global.client.user.username.toLowerCase();
        let intcom = (command) => txt.startsWith(botname + '.' + command);
            const content = txt.split(' ');
        if (intcom('eval') || intcom('evalc')) {
            try {
                content.shift();
                // const evalText = Array.isArray(content) ? content.join(' ') : content;
                // console.log(evalText);
                const out = eval('('+content+')');
                if (intcom('evalc'))
                    await message.reply('```\n'+out+'\n```');
                else
                    await message.reply(`eval > ${out}`);
            } catch(e) {
                await message.reply('Eval failed with error: ' + e, { "allowed_mentions": { "parse": [] } });
                console.warn(e);
            }
        } else if (intcom('update_commands')) {
            await message.reply(`Reloading REST commands...`);
                rest.put(Routes.applicationGuildCommands(global.client.user.id, config.primary_guild), { body: global.local_commands }).then( async () => {
                    rest.put(Routes.applicationCommands(global.client.user.id), { body: global.global_commands }).then( async (e) => {
                        await message.reply((global.commands.length) + ' slash commands Updated');
                    });
                });
        } else if (intcom('clear_commands')) {
            await message.reply(`Deleting All REST commands...`);
            rest.put(Routes.applicationCommands(global.client.user.id), { body: [] }).then( async () => {
                rest.put(Routes.applicationGuildCommands(global.client.user.id, config.primary_guild), { body: [] }).then( async () => {
                    await message.channel.send((global.commands.length) + ' slash commands Deleted');
                });
            });
        } else if (intcom('set_commands')) {
            await message.reply(`Enabling REST commands for guild with id ${content[1]}...`);
            rest.put(Routes.applicationGuildCommands(global.client.user.id, content[1]), { body: global.local_commands }).then( async () => {
                await message.channel.send((global.commands.length) + ' slash commands Updated');
            });
        } else if  (intcom('process') || intcom('info')) {
            let uptime = global.format_time(process.uptime());
            const logEmbed = new EmbedBuilder()
                .addFields({
                    name: 'Process Data',
                    value: `PID: ${process.pid} - Uptime: ${uptime}`
                }, {
                    name: 'Host and Mem',
                    value: `Platform: ${process.platform} - V8 Mem: ${process.memoryUsage().heapUsed}/${process.memoryUsage().heapTotal} Bytes`
                });
            await message.reply({ embeds: [logEmbed] });
        }
    }
});

// Reaction Roles
global.client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (reaction.partial)
		try {
			await reaction.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
    if (user.partial)
		try {
			await user.fetch();
		} catch (error) {
			console.error('Something went wrong when fetching the message:', error);
			return;
		}
    if (reaction.message.guild) {
        let guild = reaction.message.guild;
        if (global.rubydb.has(`guilds.${guild.id}`)) {
            let message = reaction.message;
            if (global.rubydb.has(`guilds.${guild.id}.reactions.${message.id}`)) {
                let react = reaction.emoji.toString();
                if (react.length != 2)
                    react = react.match(/\d+/g)[0];
                if (global.rubydb.has(`guilds.${guild.id}.reactions.${message.id}.${react}`)) {
                    guild.roles.fetch(global.rubydb.get(`guilds.${guild.id}.reactions.${message.id}.${react}`)).then(role => {
                        guild.members.fetch({ user, force: true }).then(member => {
                            member.roles.add(role);
                        })
                    })
                }
            }
        }
    }
});

// Autorole
global.client.on(Events.GuildMemberAdd, async (member) => {
    let guild = member.guild;
    if (global.rubydb.has(`guilds.${guild.id}`)) {
        if (global.rubydb.has(`guilds.${guild.id}.autorole`)) {
            guild.roles.fetch(global.rubydb.get(`guilds.${guild.id}.autorole`)).then(role => {
                member.roles.add(role);
            })
        }
    }
});

// Login
global.client.login(process.env.RUBYPASS);