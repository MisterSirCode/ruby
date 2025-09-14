require('dotenv').config();
const { FSDB } = require('file-system-db');
const { Client, Collection, Events, GatewayIntentBits, MessageFlags, REST, Routes, Partials, EmbedBuilder } = require('discord.js');
const { default: chalk } = require('chalk');
const config = require('./config.json');
const path = require('path');
const rest = new REST({ version: '10' }).setToken(process.env.RUBYPASS);
const fs = require('fs');


// Initialization
global.version = config.version;
global.color = config.color;
global.rubydb = new FSDB();
global.client = new Client({ intents: 
    [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent], partials: [Partials.Channel]});
global.client.once(Events.ClientReady, client => {
    //console.clear();
    // https://budavariam.github.io/asciiart-text/ - ANSI Shadow
    console.log(chalk.redBright(`
 ██████╗ ██╗   ██╗██████╗ ██╗   ██╗ 
 ██╔══██╗██║   ██║██╔══██╗╚██╗ ██╔╝
 ██████╔╝██║   ██║██████╔╝ ╚████╔╝ 
 ██╔══██╗██║   ██║██╔══██╗  ╚██╔╝  
 ██║  ██║╚██████╔╝██████╔╝   ██║   
 ╚═╝  ╚═╝ ╚═════╝ ╚═════╝    ╚═╝   V${config.version}
    `))
	console.log(chalk.red(`Ruby Initialized! Logged in as ${client.user.tag}`));
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
global.global_commands = [];
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
                global.commands.push(command.data.toJSON());
                global.client.commands.set(command.data.name, command);
            } else
                console.log(`Command at ${filePath} is not configured correctly`);
        } catch(e) {
            console.log(command.data);
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
        if (intcom('eval') || intcom('evalc')) {
            const content = txt.split(' ');
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
                rest.put(Routes.applicationGuildCommands(global.client.user.id, config.primary_guild), { body: global.commands }).then( async () => {
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

// Login
global.client.login(process.env.RUBYPASS);