import command from '../decorators/command';
import { embeds, members, load } from '../utils';
import { RichEmbed } from 'discord.js';

const settings = load('Meme.json');

const COMMAND_MATCH = '^$command(?: <@!?(\\d+)>)?';

export default class Meme {
	constructor() {
		this.category = {
			icon: '<:ah:439408363370184706>',
			name: 'Meme'
		};

		this.setup();
	}

	setup() {
		Object.entries(settings).forEach(([name, cmd]) => this.setupOne(name, cmd));
	}

	setupOne(name, { desc, msg, images, allowNoArg }) {
		const regex = new RegExp(COMMAND_MATCH.replace('$command', name), 'i');

		const value = (message, user) => {
			const { member, guild, client } = message;

			const to = guild.members.get(user);

			if (!allowNoArg && !to) {
				const embed = embeds.err('Aucun utilisateur trouvé 😭');

				return message.channel
					.send({ embed })
					.then(message => embeds.timeDelete(message));
			}

			return Promise.all([
				message.delete(),
				this.response(
					message,
					msg,
					images,
					user ? member : client.me,
					user ? to : member
				)
			]);
		};

		command(regex, { name, desc, usage: '[utilisateur]' })(this, name, {
			value
		});
	}

	response(message, msg, images, from, to) {
		if (false){
			if (!to) {
				const embed = embeds.err('Aucun utilisateur trouvé 😭');

				return message.channel
					.send({ embed })
					.then(message => embeds.timeDelete(message));
			}

			const send = msg
				.replace('{0}', from.displayName)
				.replace('{1}', to.displayName);

			const embed = new RichEmbed()
				.setTitle(send)
				.setColor(0x00ae86)
				.setImage(images[Math.floor(Math.random() * images.length)]);

			return message.channel.send(`<@${to.id}>`, { embed });
		}
	}
}
