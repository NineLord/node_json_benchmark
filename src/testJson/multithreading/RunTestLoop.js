//#region Imports
// Node
const fs = require('fs');
const { parentPort, workerData } = require('worker_threads');

// Project
const { run } = require('../testRunner');
const { reporter } = require('../Reporter');
//#endregion

const { testCounter, jsonPath, generateJsonParams } = workerData;

for (let count = 0; count < testCounter; ++count) {
	const testCount = count + 1;
	console.log(`Test ${testCount}`);

	run(jsonPath, generateJsonParams);
	parentPort.postMessage({
		database: reporter.toJSON(),
		testCount
	});

	reporter.clear();
}
