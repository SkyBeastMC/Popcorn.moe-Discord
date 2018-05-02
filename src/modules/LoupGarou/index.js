import { findBestMatch } from 'string-similarity';

import { command } from '../decorators';
import { shuffle, wait } from '../utils';
import { client } from '../../discord';

import roles from './roles';

const middle = ['carte1', 'carte2', 'carte3'];

const attribution = [
	'loupgarou',
	'loupgarou',
	'voleur',
	'noiseuse',
	'tanneur',
	'voyante',
	'soulard',
	'insomniaque',
	'doppelganger',
	'chasseur',
	'sbire',
	'francmacon',
	'francmacon'
];

const fill = 'villageois';

export default class LoupGarou {
	constructor() {
		this.games = new Map();
	}

	game(guildId) {
		const game = this.games.get(guildId) || {
			players: [],
			board: {},
			snapshots: []
		};
		this.games.set(guildId, game);
		return game;
	}

	// COMMANDS //

	@command(/^lg join$/)
	join({ channel, guild, author }) {
		const { players } = this.game(guild.id);
		players.push(author);
	}

	@command(/^lg start$/)
	async start({ channel, guild, author }) {
		const game = this.game(guild.id);
		game.started = true;
		game.channel = channel;

		// Setup board
		this.attribution(game);

		// Display board to users
		//todo

		// Play the game
		await play(game);
	}

	// GAME //

	attribution(game) {
		// Total number of holders
		const total = game.players.length + middle.length;

		// Fill missing card with villagers
		let attr = attribution;
		for (let i = 0; i < total - attribution.length; i++) attr.push(fill);

		// Shuffle the roles
		shuffle(attr);

		// Match each holder with his card
		game.board = [...game.players.map(u => u.id), ...middle].reduce(
			(board, holder, i) => (board[holder] = attr[i]),
			{}
		);
	}

	play() {
		return Promise.all(
			Array.from(Object.entries(roles))
				.filter(([, { turn }]) => turn) // For each roles that have a turn
				.map(([roleId, role]) =>
					Promise.all(
						Array.from(Object.entries(game.board))
							.filter(([, id]) => id === roleId) // For each player in the board that has this role
							.map(([uid]) => game.players.find(uid))
							.map(user => playRole(user, role, game)) // Play the role
					)
				)
		);
	}

	async playRole(user, role, game) {
		await role.turn.apply(this, [user, game]);
	}

	// UTIL //

	async playerResponse(players, user, embed) {
		const message = await user.send({ embed });
		return new Promise((resolve, reject) => {
			const callback = ({ channel, content }) => {
				if (id === channel.id) {
					const { bestMatch: { target } } = findBestMatch(
						content,
						players.map(p => p.username)
					);

					client.removeListener('message', callback);
					resolve(players.find(u => u.username === target)); //todo confirmation
				}
			};
			client.on('message', callback);
		});
	}
}
