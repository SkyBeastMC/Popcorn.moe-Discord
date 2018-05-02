import { command } from '../decorators';
import { shuffle } from '../utils';

const roles = {
	doppelganger: {},
	loupgarou: {},
	sbire: {},
	francmacon: {},
	voyante: {},
	voleur: {},
	noiseuse: {},
	soulard: {},
	insomniaque: {},
	tanneur: {},
	chasseur: {},
	villageois: {}
};

const middle = ['carte1', 'carte2', 'carte3']

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
		const game = this.games.get(guildId) || { players: [], board: {}, snapshots: [] };
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
	start({ channel, guild, author }) {
		const game = this.game(guild.id);
        game.started = true;
        game.channel = channel;

        // Setup board
        this.attribution(game);

    }
    
    // GAME //

    attribution(game) {
        // Total number of holders
        const total = game.players.length + middle.length
        
        // Fill missing card with villagers
        let attr = attribution
        for (let i = 0; i < total - attribution.length; i++)
            attr.push(fill)

        // Shuffle the roles 
        shuffle(attr);

        // Match each holder with his card
        game.board = [...game.players, ...middle].reduce((board, holder, i) => board[holder] = attr[i], {})
    }
}
