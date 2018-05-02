import { command } from '../decorators';
import { shuffle } from '../utils';
import wait from '../utils/wait';

const roles = {
	doppelganger: {
		name: 'Doppelgänger',
		turn: true
	},
	loupgarou: {
		name: 'Loup-Garou',
		turn: true
	},
	sbire: {
		name: 'Sbire',
		turn: true
	},
	francmacon: {
		name: 'Franc-maçon',
		turn: true
	},
	voyante: {
		name: 'Voyante',
		turn: true
	},
	voleur: {
		name: 'Voleur',
		turn: true
	},
	noiseuse: {
		name: 'Noiseuse',
		turn: true
	},
	soulard: {
		name: 'Soûlard',
		turn: true
	},
	insomniaque: {
		name: 'Insomniaque',
		turn: true
	},
	tanneur: {
		name: 'Tanneur'
	},
	chasseur: {
		name: 'Chasseur'
	},
	villageois: {
		name: 'Villageois'
	}
};

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
							.map(user => playRole(user, roleId, role)) // Play the role
					)
				)
		);
	}

	async playRole(user, roleId, role) {}
}
