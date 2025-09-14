const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

const subs = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];

function replaceSubs(string) {
    let matches = string.match(/<sub>(\d+)<\/sub>/g);
    let gaps = string.split(/<sub>\d+<\/sub>/g);
    let replace = [];
    try {
        if (matches.length > 0) {
            matches.forEach(element => {
                let numbers = element.match(/\d/g);
                let swaps = [];
                numbers.forEach(number => {
                    swaps.push(subs[+number]);
                });
                replace.push(`<sub>${swaps.join('')}</sub>`);
            });
            let combined = "";
            for (let i = 0; i < gaps.length; i++) {
                combined += gaps[i];
                if (replace[i])
                combined += replace[i];
            }
            return (combined
                .replace(/<sub>/g, '')
                .replace(/<\/sub>/g, '') +
                '\n-# ' + string
                .replace(/<sub>/g, '')
                .replace(/<\/sub>/g, ''));
        } else {
            return string;
        }
    } catch(e) {
        return string;
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mineral')
		.setDescription('Load some information about a mineral species or mindat mineral id')
        .addStringOption(option => option
            .setName('species')
            .setDescription('Species name or Mindat Mineral ID')),
	async execute(interaction) {
		const name = ("" + interaction.options.getString('species')).toLowerCase();
        const mindat = global.mindat;
        let match;
        for (let i = 0; i < mindat.length; i++) {
            let mineral = mindat[i];
            if ((mineral.name.toLowerCase() == name) || (mineral.id == name)) {
                match = mineral;
                break;
            }
        }
        if (match.name) {
            let embed = new EmbedBuilder()
                .setTitle(`Information about ${match.name}`)
                .setColor(global.color)
                .setDescription(match.description_short || "")
                .addFields({
                    name: 'View on Mindat', 
                    value: `[Mindat.org <:mindat:1416641235799638026>](https://mindat.org/min-${match.id}.html)`,
                    inline: true
                })
            if (match.mindat_formula) {
                let formula = replaceSubs(match.mindat_formula);
                embed.addFields({ 
                    name: 'Formula', value: formula, inline: true 
                });
            }
            if (match.csystem) {
                embed.addFields({
                    name: 'Crystal System', 
                    value: `${match.csystem}\n${match.opticaltype ? '(' + match.opticalsign + match.opticaltype + ')' : ''}`, 
                    inline: true
                })
            }
            if (match.hardtype > 0) {
                embed.addFields({
                    name: 'Hardness',
                    value: (match.hardtype == 3 | match.hardtype == 4 ? 'Mohs ' : '') +
                        (match.hmax > match.hmin ? match.hmin + '-' + match.hmax : match.hmin),
                    inline: true
                })
            }
		    await interaction.reply({ embeds: [embed] });
        } else await interaction.reply({ content: 'No mineral found with given name or ID' });
	},
};