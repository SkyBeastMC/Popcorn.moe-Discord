import { on } from '../decorators';
import { load } from '../utils';

const settings = load('GroupChange.json');

export default class GroupChange {
	@on('message')
	onMessage() {
		console.log('licorne');
	}
}
