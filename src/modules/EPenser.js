import { RichEmbed, Permissions } from 'discord.js';
import { on, command, needPermissions } from '../decorators';
import { load } from '../utils';
import { client } from '../discord';

const { activeUsers, questions, newMember, readRules } = load('EPenser.json');

const settings = load('global.json');

export default class EPenser {
	constructor() {
		this.category = {
			icon: '<:3_:431578215086292993>',
			name: 'EPenser',
			desc: 'Commandes en rapport à Bruce'
		};
	}

	/**
	 * @SkyBeastMC :
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
	@command(/^q (.{14,}[\?\.\)])$/, {
		//regex powaaa (:
		name: 'q',
		desc: 'Poser une question',
		usage: '[question]'
	})
	@needPermissions(Permissions.FLAGS.SEND_MESSAGES)
	async questions(message, question) {
		if (!questions.enabled) return;

		const { guild, postedAt, member } = message;

		if (!guild.channels.find('name', questions.channel)) {
			await guild.createChannel(questions.channel, 'text');
			await message.channel.send(
				'[**Channel de questions**] Channel pour les questions à Bruce.'
			);
		}

		const qChannel = guild.channels.find('name', questions.channel);

		const embed = new RichEmbed()
			.setAuthor(member.displayName, member.user.displayAvatarURL)
			.setColor(0x2f73e0)
			.setDescription(question)
			.setTimestamp(postedAt);

		return Promise.all([
			message.delete(),
			qChannel
				.send(`${member.user} :`, { embed })
				.then(message => message.react('👍')) //Ensure order
				.then(react => react.message.react('👎'))
				.then(react => react.message.react('❌'))
		]);
	}

	@on('messageReactionAdd')
	async questionsDel({ message, emoji, me }, user) {
		if (!questions.enabled) return;

		const member = message.guild.members.get(user.id);
		return (
			emoji.name === '❌' &&
			!me && 
			message.channel.name === questions.channel &&
			member &&
			member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) &&
			message.delete()
		);
	}

	@on('ready')
	async fetchQuestions() {
		settings.guilds
			.map(sGuild => client.guilds.get(sGuild.id))
			.map(guild => guild.channels.find('name', questions.channel))
			.filter(channel => channel && channel.fetchMessages)
			.map(channel => channel.fetchMessages({ limit: 100 })); //Allow the bot to listen to reactions in previous messages.
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

	/**
	 * @SkyBeastMC :
	 * Auto ajout du grade e-penseur à ceux qui ont lu les regles
	 */
	@on('message')
	readRules(message) {
		if (!readRules.enabled) return;

		const { member, content, channel } = message;

		if (channel.id !== readRules.channel) return;

		const roles = member.roles.values();
		if (roles.length !== 1 || roles[0].id !== readRules.viewerRole)
			return message.delete();

		if (content === readRules.message)
			return Promise.all([
				message.delete(),
				member.send(readRules.rankupMessage),
				member.removeRole(readRules.viewerRole),
				member.addRole(readRules.rankupRole)
			]);
		else
			return Promise.all([
				message.delete(),
				member.send(readRules.failMessage)
			]);
	}
}
