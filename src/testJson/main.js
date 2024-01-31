//#region Imports
// Node
const fs = require('fs');
const { homedir } = require('os');
const { resolve } = require('path');
const { Worker } = require('worker_threads');

// 3rd Party
const { program } = require('commander');

// Project
const { ExcelGenerator } = require('./ExcelGenerator');
const { ExtendLodash } = require('../utils/ExtendLodash');
//#endregion

// clear ; node --max-old-space-size=6144 testJson/main.js "/PATH/TO/Input/hugeJson_numberOfLetters8_depth10_children5.json" 5 --number-of-letters=8 --depth=10 --minimum-children=5 --sampling-interval=10

const globals = {
	TEST_COUNTER: 5,
	PATH_TO_SAVE_FILE: `${homedir()}/report.xlsx`,
	PC_USAGE_SAMPLING_INTERVAL: 50, // Milliseconds
	PATH_TO_PC_USAGE_EXPORTER_FILE: resolve(__dirname, './multithreading/PcUsageExporter.js'),
	PATH_RUN_TEST_LOOP_FILE: resolve(__dirname, './multithreading/RunTestLoop.js'),
	NUMBER_OF_LETTERS: 32,
	DEPTH: 256,
	MINIMUM_CHILDREN: 16,
	MAXIMUM_CHILDREN: 16,
	PATH_TO_DEBUG_DIRECTORY: resolve(__dirname, '../../junk')
};

program
	.name('jsonTester')
	.description('Tests JSON manipulations')
	.argument('<jsonPath>', 'Absolute path to the JSON file that will be tested')
	.argument('[testCounter]', 'The number of times will run the tests', globals.TEST_COUNTER)
	.option('-s, --save-file <string>', 'Absolute path to save the excel report file to', globals.PATH_TO_SAVE_FILE)
	.option('-i, --sampling-interval <number>', `The interval in which it will sample the CPU/RAM usage of the system while running the tests, units are in milliseconds`, globals.PC_USAGE_SAMPLING_INTERVAL)
	.option('-n, --number-of-letters <number>', `The total number of letters that each generated node name will have in the generated JSON tree`, globals.NUMBER_OF_LETTERS)
	.option('-d, --depth <number>', `The depth of the generated JSON tree`, globals.DEPTH)
	.option('-m, --minimum-children <number>', `The minimum number of children each node should have in the generated JSON tree`, globals.MINIMUM_CHILDREN)
	.option('-D, --debug', `If true, will also save the results as JSON to ${globals.PATH_TO_DEBUG_DIRECTORY}`)
	.action((jsonPath, testCounter) => {
		const flags = program.opts();

		if (testCounter === undefined) testCounter = globals.TEST_COUNTER;
		const sampleInterval = flags.samplingInterval === undefined ? globals.PC_USAGE_SAMPLING_INTERVAL : Number(flags.samplingInterval);
		const pathToSaveFile = flags.saveFile === undefined ? globals.PATH_TO_SAVE_FILE : flags.saveFile;
		const numberOfLetters = flags.numberOfLetters === undefined ? globals.NUMBER_OF_LETTERS : Number(flags.numberOfLetters);
		const depth = flags.depth === undefined ? globals.DEPTH : Number(flags.depth);
		const minimumChildren = flags.minimumChildren === undefined ? globals.MINIMUM_CHILDREN : Number(flags.minimumChildren);
		const debug = flags.debug === undefined ? false : flags.debug;
		if (!ExtendLodash.isExists(jsonPath)) {
			console.error(`The given path to the JSON file isn't valid: ${jsonPath}`);
			process.exit(1);
		}

		const excelGenerator = new ExcelGenerator();

		let pcUsage = [];
		const pcUsageExporterWorker = new Worker(globals.PATH_TO_PC_USAGE_EXPORTER_FILE, {
			workerData: { sampleInterval }
		});
		pcUsageExporterWorker.on('message', usage => {
			pcUsage.push(usage);
		} );

		const runTestLoopWorker = new Worker(globals.PATH_RUN_TEST_LOOP_FILE, {
			workerData: { testCounter, jsonPath, generateJsonParams: { numberOfLetters, depth, minimumChildren } }
		});
		runTestLoopWorker.on('message', ({ database, testCount }) => {
			if (debug)
				fs.writeFileSync(`${globals.PATH_TO_DEBUG_DIRECTORY}/test${testCount}.json`, JSON.stringify({ database, pcUsage }));
			excelGenerator.appendWorksheet(`Test ${testCount}`, database, pcUsage);
			pcUsage = [];
		});
		runTestLoopWorker.on('exit', () => {
			// noinspection JSIgnoredPromiseFromCall
			pcUsageExporterWorker.terminate();

			console.log('Saving...');
			excelGenerator.saveAs(pathToSaveFile, jsonPath, sampleInterval, numberOfLetters, depth, minimumChildren);
		});
	});

program.parse();
