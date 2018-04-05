import { Permissions } from 'discord.js';
import { command, needPermissions } from '../decorators';
import { load } from '../utils';
import { spawn } from 'child_process';
import { blue } from 'chalk';

const { script } = load('Restart.json');

export default class Restart {
    @command(/^restart$/)
    @needPermissions(Permissions.FLAGS.MANAGE_GUILD)
	async restart(message) {
        spawn(script, [], {
            shell: true,
            detached: true,
            stdio: 'inherit'
        })
        await Promise.all([message.delete(), message.reply('Le bot va redémarrer...')]);
        console.log(blue.bold('Restarting!'))
        process.exit(0);
	}
}
