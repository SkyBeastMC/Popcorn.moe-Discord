import { RichEmbed } from 'discord.js';
import { command } from '../decorators';
import { load } from '../utils';
import { INSTANCE, commands } from '../Modules';

const settings = load('global.json');

export default class Help {
	constructor() {
		this.category = {
			order: 10,
			icon: '❓',
			name: 'Aide'
		};
	}

	@command(/^help$/, {
		name: 'help',
		desc: "Afficher une page d'aide à propos d'une commande"
	})
	help(message) {
		const sGuild = settings.guilds && settings.guilds[message.guild.id];
		const botsChannel =
			sGuild && sGuild.channels && message.guild.channels[sGuild.channels.bots];

		if (!this.embed) this.embed = this.generateHelp();

		return Promise.all([
			message.delete(),
			(botsChannel || message.member).send(`${message.author}`, {
				embed: this.embed
			})
		]);
	}

	generateHelp() {
		const embed = new RichEmbed()
			.setTitle('Commandes :')
			.setImage(settings.images.help)
			.setThumbnail(settings.images.helpThumbnail)
			.setColor(0x8ed16c)
			.setTimestamp()
			.setFooter('e-penser discord', settings.images.mainIcon);

		const categories = new Map();

		for (const {
			target,
			options: { name, usage = '', aliases = [], desc }
		} of commands.values()) {
			const { category } = target[INSTANCE];

			if (!category || !name) continue;

			if (!categories.has(category)) categories.set(category, []);
			categories.get(category).push({ name, usage, aliases, desc });
		}

		for (const [category, cmds] of Array.from(categories.entries()).sort(
			([a = {}], [b = {}]) => b.order || 0 - a.order || 0
		)) {
			embed.addField(
				`${category.icon || '▶'} **${category.name}** ${
					category.desc ? '- ' + category.desc : ''
				}`, // ▶ is an emoji
				cmds
					.map(({ name, usage, aliases, desc }, i) => {
						const last = i === cmds.length - 1;

						return (
							`${last ? '┗►' : '┣►'} **${settings.prefix}${name} ${usage}**` +
							(aliases.length
								? ' [*alias: ' + aliases.join(', ') + '*]\n'
								: '\n') +
							(desc ? `${last ? '     ' : '┃ '}     ╰> *${desc}*\n` : '')
						);
					})
					.join('┃\n')
			);
		}

		return embed;
	}
}
