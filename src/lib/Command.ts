export const handleCommand = (message: string) => {
	if (typeof window === 'undefined') {
		console.error('This command can only be run in a browser environment.');
		return;
	}

	const command = message.trim().split(' ')[0];

	switch (command) {
		case '!eaglechat':
			const subCommand = message.trim().split(' ')[1];
			if (subCommand === 'reload') {
				window.location.reload();
			} else {
				console.error('Unknown sub-command for !eaglechat');
			}
			break;
		default:
	}
};
