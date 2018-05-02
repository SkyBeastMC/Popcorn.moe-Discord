export default {
	doppelganger: {
		name: 'Doppelgänger',
		turn() {}
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
		async turn(user, game) {
			const embed = new RichEmbed()
				.setDescription(
					"✅ C'est à votre tour.\nChoisissez votre cible pour découvrir sa carte."
				)
				.setFooter('Vous êtes la voyante.');

			const response = await this.playerResponse(game.players, user, embed);

			user.send({
				embed: new RichEmbed().setDescription(
					'La carte est **' + game.board[response.id] + '**'
				)
			});
		}
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
