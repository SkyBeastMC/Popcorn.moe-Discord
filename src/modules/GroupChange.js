import { on } from '../decorators';
import { load } from '../utils';

const { time, pages, threshold, role } = load('GroupChange.json');

export default class GroupChange {
	@on('message')
	async onMessage(message) {
		const since = new Date().getTime() - time;

		const n = 
			(
				(await Promise.all(
					Array.from(message.guild.channels.values())
						.filter(channel => channel.fetchMessages) // text channels only
						.map(channel => channel.fetchMessages({ limit: 100 }))
				))
					.map(fetch => fetch.values())
					.reduce((array, o) => array.concat(Array.from(o)), []) // merge: Array<Array<Message>> => Array<Message>
					.filter(message => message.author.id === message.author.id)
					.filter(message => message.createdAt.getTime() >= since)
			).length;

		if (n >= threshold) await message.member.addRole(role, '[Bot] utilisateur actif');
	}
}
