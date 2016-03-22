'use strict';

exports.command = function (cmd, args) {
	const spawn = require('child_process').spawnSync;
	const process = spawn(cmd, args);
	return process.stdout.toString();
}
