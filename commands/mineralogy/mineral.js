const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const he = require('he');

const subs = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉', '₊', '₋'];
const sups = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁺', '⁻'];

/// Pull out subscript numbers and replace them with the unicode versions
function sub(x) {
    return x.split('').map(c =>
        c === '+' ? subs[10] : c === '-' ? subs[11] : subs[+c]
    ).join('');
}

function sup(x) {
    return x.split('').map(c =>
        c === '+' ? sups[10] : c === '-' ? sups[11] : sups[+c]
    ).join('');
}

global.replaceSubs = (str) => {
    let out = he.decode(str)
        .replace(/<sub>([\d+\-]+)<\/sub>/g, (_, d) => sub(d))
        .replace(/<sup>([\d+\-]+)<\/sup>/g, (_, d) => sup(d))
        .replace(/([A-Za-z])(\d*)([+-])/g, (_, e, n, sign) => e + sup((n||'') + sign))
        .replace(/·/g, ' · ')
        .replace(/◻/g, '')
        .replace(/<\/?sub>|<\/?sup>/g, '');
    return out + `\n-# ${str.replace(/<\/?sub>|<\/?sup>/g, '')}`;
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
        let isvariety = false;
        for (let i = 0; i < mindat.length; i++) {
            let mineral = mindat[i];
            if ((mineral.name.toLowerCase() == name) || (mineral.id == name)) {
                match = mineral;
                break;
            }
        }
        if (match) {
            let rep;
            if (match.entrytype == 2) {
                isvariety = true;
                for (let i = 0; i < mindat.length; i++) {
                    let mineral = mindat[i];
                    if ((mineral.id == match.varietyof)) {
                        rep = mineral;
                        break;
                    }
                }
            }
            let desc = (isvariety ? 
                    (match.aboutname ? match.aboutname : rep.description_short) : 
                    match.description_short);
            let embed = new EmbedBuilder()
                .setTitle(`Information about ${isvariety ? rep.name + ' var ' + match.name : match.name}`)
                .setColor(global.color)
                .setDescription(desc.replace(/<m>|<\/m>/g, ''))
                .addFields({
                    name: 'View on Mindat', 
                    value: `[Mindat.org <:mindat:1416641235799638026>](https://mindat.org/min-${match.id}.html)`,
                    inline: true
                })
            if (isvariety ? rep.mindat_formula : match.mindat_formula) {
                let formula = global.replaceSubs(isvariety ? rep.mindat_formula : match.mindat_formula);
                embed.addFields({
                    name: 'Formula', value: formula.replaceAll('&middot;', ' · '), inline: true 
                });
            }
            if (isvariety ? rep.csystem : match.csystem) {
                embed.addFields({
                    name: 'Crystal System', 
                    value: `${isvariety ? rep.csystem : match.csystem}\n${
                        (isvariety ? rep.opticaltype : match.opticaltype) ? '(' + 
                        (isvariety ? rep.opticalsign : match.opticalsign) + 
                        (isvariety ? rep.opticaltype : match.opticaltype) + ')' : ''}`, 
                    inline: true
                })
            }
            if (isvariety ? rep.hardtype : match.hardtype > 0) {
                let hardtype = isvariety ? rep.hardtype : match.hardtype;
                let hmax = isvariety ? rep.hmax : match.hmax;
                let hmin = isvariety ? rep.hmin : match.hmin;
                embed.addFields({
                    name: 'Hardness',
                    value: (hardtype == 3 | hardtype == 4 ? 'Mohs ' : '') +
                        (hmax > hmin ? hmin + '-' + hmax : hmin),
                    inline: true
                })
            }
		    await interaction.reply({ embeds: [embed] });
        } else await interaction.reply({ content: 'No mineral found with given name or ID' });
	},
};