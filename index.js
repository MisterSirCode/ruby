require('dotenv').config();
const { FSDB } = require("file-system-db");
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { default: chalk } = require('chalk');


// Initialization
global.rubydb = new FSDB();
global.client = new Client({ intents: [GatewayIntentBits.Guilds] });

global.client.once(Events.ClientReady, client => {
	console.log(chalk.redBright(`Ruby Initialized. Logged in as ${client.user.tag}`));
});

global.client.login(process.env.RUBYPASS);