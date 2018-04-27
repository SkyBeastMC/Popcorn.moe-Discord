import { RichEmbed, Permissions } from 'discord.js';
import { on, command, needPermissions } from '../decorators';
import { load } from '../utils';
import { client } from '../discord';

const { activeUsers, questions, newMember, readRules } = load('EPenser.json');

const settings = load('global.json');

export default class EPenser {
	constructor() {
		this.category = {
			icon: '<:3_:439408363441487882>',
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
	@command(/^q (.+)$/, {
		name: 'q',
		desc: 'Poser une question',
		usage: '[question]'
	})
	@needPermissions(Permissions.FLAGS.SEND_MESSAGES)
	async questions(message, question) {
		if (!questions.enabled) return;

		if (!questions.listenChannels.includes(message.channel.id)) return;

		const { guild, postedAt, member } = message;
		const qChannel = guild.channels.get(questions.channel);

		if (!/^.{14,}[\?\.\)]$/.exec(question))
			return Promise.all([
				member.send(
					questions.failMessage +
						`\nVotre question: \`${question.replace('`', '\\`')}\``
				),
				message.delete()
			]);

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
	async questionsDel({ message, emoji }, { id, bot }) {
		if (!questions.enabled) return;

		const member = message.guild.members.get(id);
		return (
			emoji.name === '❌' &&
			!bot &&
			message.channel.name === questions.channel &&
			member &&
			(member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) ||
				member.user.id === message.mentions.users.firstKey()) &&
			message.delete()
		);
	}

	//Allow the bot to listen to reactions in previous messages.
	@on('ready')
	fetchQuestions() {
		if (!questions.enabled) return;

		return Promise.all(
			settings.guilds
				.map(sGuild => client.guilds.get(sGuild.id))
				.map(guild => guild.channels.get(questions.channel))
				.filter(channel => channel && channel.fetchMessages)
				.map(channel => channel.fetchMessages({ limit: 100 }))
		);
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

	//Ajout du role on startup / reload (safety)
	@on('ready')
	newMemberStartup() {
		if (!newMember.enabled) return;

		const guild = client.guilds.get(newMember.guild);
		const eViewer = guild.roles.get(newMember.role);

		return Promise.all(
			guild.members
				.array()
				.filter(({ roles }) => roles.size === 1)
				.map(member => member.addRole(eViewer))
		);
	}

	/**
	 * @SkyBeastMC :
	 * Auto ajout du grade e-penseur à ceux qui ont lu les regles
	 */
	@on('message')
	readRules(message) {
		if (!readRules.enabled) return;

		const { member, content, channel, guild, author } = message;

		if (channel.id !== readRules.channel) return;

		const roles = member.roles.array();
		if (roles.length !== 2 || roles[1].id !== readRules.viewerRole)
			//account for @everyone role
			return message.delete();

		const announce =
			readRules.announce && guild.channels.get(readRules.announceChannel);

		if (
			readRules.message === content ||
			(typeof readRules.message === 'object' &&
				readRules.message.includes(content))
		)
			return Promise.all([
				message.delete(),
				member.send(readRules.rankupMessage),
				member.removeRole(readRules.viewerRole),
				member.addRole(readRules.rankupRole),
				announce &&
					announce.send(
						readRules.announceRankupMessage.replace('$user', author)
					)
			]);
		else
			return Promise.all([
				message.delete(),
				member.send(readRules.failMessage)
			]);
	}
}
