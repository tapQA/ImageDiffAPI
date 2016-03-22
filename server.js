'use strict';

const run = require(__dirname + '/run');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const app = express();

const UPLOAD_FIEDS = [{ name: 'screenshot', maxCount: 1 }];
const PORT = process.env.PORT || 3000;
const CONTROL_DIR = __dirname + '/control';
const SCREENSHOTS_DIR = __dirname + '/screenshots';

/**
 * Helper function to get storage config object for multer
 * @param  {String} destination - Output dir
 * @return {Object}
 */
function getDiskStorageObject(destination) {
	return {
		destination,
		filename: (req, file, cb) => {
			cb(null, Date.now() + '-' + file.originalname);
		}
	}
}

// Override default write location and name
const storage = multer.diskStorage(getDiskStorageObject(SCREENSHOTS_DIR));
const controlStorage = multer.diskStorage(getDiskStorageObject(CONTROL_DIR));
const upload = multer({ storage });
const controlUpload = multer({ storage: controlStorage });

app.post('/api/images', upload.fields(UPLOAD_FIEDS), (req, res) => {
	res.json({ status: 'screenshot uploaded' });
});

app.post('/api/control', controlUpload.fields(UPLOAD_FIEDS), (req, res) => {
	res.json({ status: 'control uploaded'});

	// Remove outdated images
	// Because of the timestamp on the images
	// the last image will always be the most recent
	const files = fs.readdirSync(CONTROL_DIR);
	const lastFileIndex = files.length - 1;

	if (files.length > 1) {
		files.forEach((file, index) => {
			if (index !== lastFileIndex) {
				fs.unlinkSync(CONTROL_DIR + '/' + file);
			}
		});
	}
});

app.get('/api/start_diffing', (req, res) => {
	const control = CONTROL_DIR + '/' + fs.readdirSync(CONTROL_DIR)[0];
	const files = fs.readdirSync(SCREENSHOTS_DIR);
	
	let failedTests = [];

	files.forEach((file) => {
		const test = SCREENSHOTS_DIR + '/' + file;
		const cmd = run.command( 'perceptualdiff', [control, test] );
		if (cmd && cmd.length) // perceptualdiff only outputs if something failed
			failedTests.push(file);
	});

	res.json({ failedTests });
});

app.listen(PORT, () => console.log('App listening on port ' + PORT));
