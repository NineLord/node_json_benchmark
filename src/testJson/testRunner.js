//#region Imports
// Node
const fs = require('fs');

// Project
const Reporter = require('./Reporter');
const { generateJson } = require('../jsonGenerate/Generator');
const { breadthFirstSearch } = require('../searchTree/breadthFirstSearch');
const { depthFirstSearch } = require('../searchTree/depthFirstSearch');
//#endregion

/**
 * Run a test about JSON serializing/deserializing/querying.
 * @param {string} jsonPath The absolute path to the JSON file to be tested on.
 *
 * @param {object} generateJsonParams Parameterizing relating to generating json.
 * @param {number} generateJsonParams.numberOfLetters Positive number showing the number of letters each node name should have.
 * @param {number} generateJsonParams.depth The depth of the JSON tree.
 * @param {number} generateJsonParams.minimumChildren The minimum number of children in each node.
 */
function run(jsonPath, generateJsonParams) {
	const reporter = Reporter.reporter;

	//#region Generating JSON
	console.log('Generating JSON...');
	const { numberOfLetters, depth, minimumChildren } = generateJsonParams;
	const generatedJsonStart = reporter.startMeasuring(Reporter.GENERATE_JSON);
	const generatedJson = generateJson(true, "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz!@#$%&",
		numberOfLetters, depth, minimumChildren, minimumChildren);
	reporter.finishMeasuring(generatedJsonStart, Reporter.GENERATE_JSON);
	//#endregion

	const rawJson = fs.readFileSync(jsonPath).toString();

	//#region Deserializing JSON
	console.log('Deserializing JSON');
	const deserializeJsonStart = reporter.startMeasuring(Reporter.DESERIALIZE_JSON);
	const actualJson = JSON.parse(rawJson);
	reporter.finishMeasuring(deserializeJsonStart, Reporter.DESERIALIZE_JSON);
	//#endregion

	const valueToSearch = 2_000_000_000;

	//#region Iterating Iteratively JSON
	console.log('Iterating Iteratively JSON...');
	const iterateIterativelyStart = reporter.startMeasuring(Reporter.ITERATE_ITERATIVELY);
	if (breadthFirstSearch(actualJson, valueToSearch)) {
		console.error(`BFS the tree found value that shouldn't be in it: ${valueToSearch}`);
		process.exit(1);
	}
	reporter.finishMeasuring(iterateIterativelyStart, Reporter.ITERATE_ITERATIVELY);
	//#endregion

	//#region Iterating Recursively JSON
	console.log('Iterating Recursively JSON...');
	const iterateRecursivelyStart = reporter.startMeasuring(Reporter.ITERATE_RECURSIVELY);
	if (depthFirstSearch(actualJson, valueToSearch)) {
		console.error(`DFS the tree found value that shouldn't be in it: ${valueToSearch}`);
		process.exit(1);
	}
	reporter.finishMeasuring(iterateRecursivelyStart, Reporter.ITERATE_RECURSIVELY);
	//#endregion

	//#region Serializing JSON
	console.log('Serializing JSON...');
	const serializeJsonStart = reporter.startMeasuring(Reporter.SERIALIZE_JSON);
	const backToRawJson = JSON.stringify(actualJson);
	reporter.finishMeasuring(serializeJsonStart, Reporter.SERIALIZE_JSON);
	//#endregion
}

module.exports = {
	run
}
