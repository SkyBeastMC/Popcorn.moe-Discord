import { Permissions } from 'discord.js';
import { command, needPermissions } from '../decorators';
import { load } from '../utils';
import { spawn } from 'child_process';
import { yellow } from 'chalk';

const { runScript, script } = load('Restart.json');

export default class Restart {
	@command(/^restart$/)
	@needPermissions(Permissions.FLAGS.MANAGE_ROLES)
	async restart(message) {
		await Promise.all([
			message.delete(),
			message.reply('Le bot va redémarrer...')
		]);
		runScript && spawn(script, [], {
			shell: true,
			detached: true,
			stdio: 'inherit'
		});
		console.log(yellow.bold('Restarting!'));
		process.exit(0);
	}
}
