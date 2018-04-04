import { RichEmbed } from 'discord.js';
import { on, command } from '../decorators';
import { load } from '../utils';

const { activeUsers, questions, newMember } = load('EPenser.json');

export default class EPenser {
	/**
	 * @SkyBeast :
	 * Groupe pour utilisateurs actifs.
	 */
	@on('message')
	async activeUsers(message) {
		if (!activeUsers.enabled) return;

		const since = new Date().getTime() - activeUsers.time;

		const n = (await Promise.all(
			Array.from(message.guild.channels.values())
				.filter(channel => channel.fetchMessages) // text channels only
				.map(channel => channel.fetchMessages({ limit: 100 }))
		))
			.map(fetch => fetch.values())
			.reduce((array, o) => array.concat(Array.from(o)), []) // merge: Array<Array<Message>> => Array<Message>
			.filter(message => message.author.id === message.author.id)
			.filter(message => message.createdAt.getTime() >= since).length;

		if (n >= activeUsers.threshold)
			await message.member.addRole(activeUsers.role, '[Bot] utilisateur actif');
	}

	/**
	 * @Iryu :
	 * Recuperateur de question.
	 *
	 * Fonctionnement : Quand un utilisateur utilise la commande q, recupere sa question et la poste dans un channel #questions
	 */
	//Thanks @Iryu : https://pastebin.com/9zKuJ6dT
	@command(/^q (.+[\?\.\)])$/) //regex powaaa (:
	async questions({ guild }, msg) {
		if (!questions.enabled) return;

		if (!guild.channels.find('name', 'questions')) {
			await guild.createChannel('questions', 'text');
			await message.channel.send(
				'[**Channel de questions**] Channel pour les questions à Bruce.'
			);
		}

		const qChannel = guild.channels.find('name', questions.channel);

		const embed = new RichEmbed()
			.setTitle(msg)
			.setDescription('Question posée par : ' + message.author);
		await qChannel.send({ embed });
	}

	/**
	 * @Iryu :
	 * Auto ajout d'un nouveau membre.
	 *
	 * Fonctionnement : Quand un nouveau membre arrive sur le serveur, l'ajoute automatiquement au grade E-viewer.
	 */
	//Thanks @Iryu : https://pastebin.com/9zKuJ6dT
	@on('guildMemberAdd')
	newMember(member) {
		if (!newMember.enabled) return;

		const eViewer = member.guild.roles.get(newMember.role);
		return member.addRole(eViewer);
	}
}
