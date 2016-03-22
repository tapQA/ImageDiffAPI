'use strict';

const run = require(__dirname + '/run');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const app = express();

function getDiskStorageObject(destination) {
	return {
		destination,
		filename: (req, file, cb) => {
			cb(null, Date.now() + '-' + file.originalname);
		}
	}
}

// Override default write location and name
const storage = multer.diskStorage(getDiskStorageObject('./screenshots'));
const controlStorage = multer.diskStorage(getDiskStorageObject('./control'));
const upload = multer({ storage });
const controlUpload = multer({ storage: controlStorage });

const uploadFields = [{ name: 'screenshot', maxCount: 1 }];
const PORT = process.env.PORT || 3000;

app.post('/api/images', upload.fields(uploadFields), (req, res) => {
	res.json({ status: 'screenshot uploaded' });
});

app.post('/api/control', controlUpload.fields(uploadFields), (req, res) => {
	res.json({ status: 'control uploaded'});

	// Remove outdated images
	// Because of the timestamp on the images
	// the last image will always be the most recent
	const files = fs.readdirSync(__dirname + '/control');
	const lastFileIndex = files.length - 1;

	if (files.length > 1) {
		files.forEach((file, index) => {
			if (index !== lastFileIndex) {
				fs.unlinkSync(__dirname + '/control/' + file);
			}
		});
	}
	
});

app.get('/api/start_diffing', (req, res) => {
	const control = __dirname + '/control/1458671410086-Travis-CI.png';
	const files = fs.readdirSync(__dirname + '/screenshots');
	
	let failedTests = [];

	files.forEach((file) => {
		let cmd = run.command( 'perceptualdiff', [control, __dirname + '/screenshots/' + file] );
		if (cmd && cmd.length)
			failedTests.push(file);
	});

	res.json({ failedTests });
});

// app.post('/api/start_diffing', )

app.listen(PORT, () => console.log('App listening on port ' + PORT));
