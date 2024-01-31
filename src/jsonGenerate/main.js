//#region Imports
// Node
const fs = require('fs');
const os = require('os');

// 3rd Party
const { program } = require('commander');

// Project
const { generateJson } = require('./Generator');
//#endregion

// clear ; node --max-old-space-size=6144 src/jsonGenerate/main.js --full-tree --alphabet-count=26 --number-of-letters=8 --depth=10 --minimum-children=5 --maximum-children=5

const globals = {
	ALPHABET: 'abcdefghijklmnopqrstuvwxyz',
	SPECIAL_CHARACTERS: '!@#$%&',
	DEFAULT: {
		ALPHABET_COUNT: 3,
		NUMBER_OF_LETTERS: 7,
		DEPTH: 100,
		MINIMUM_CHILDREN: 3,
		MAXIMUM_CHILDREN: 8,
		PATH_TO_SAVE_FILE: `${os.homedir()}/generatedJson.json`
	}
};

/**
 * Parse the given input into a valid number.
 * @param {string|undefined} flag The given input.
 * @param {number} defaultValue The default value to return if the input isn't valid.
 * @param {function(number): boolean} predicate A function that gets the input as number and return true if it is NOT valid.
 * @return {number} A valid parsed number from the input.
 */
function parseInputNumber(flag, defaultValue, predicate) {
	if (flag === undefined)
		return defaultValue;
	else {
		const flagNumber = Number(flag);
		if (isNaN(flagNumber) || predicate(flagNumber))
			return defaultValue;
		else
			return flagNumber;
	}
}

/**
 * Parses the input from the program's flags.
 * @param {string|undefined} file The absolute path to the save file.
 * @return {{
 * filePath: string,
 * alphabetCount: number,
 * specialCharacters: boolean,
 * numberOfLetters: number,
 * depth: number,
 * minimumChildren: number,
 * maximumChildren: number,
 * debug: boolean,
 * print: boolean,
 * fullTree: boolean}} The program input data.
 */
function parseInput(file) {
	const flags = program.opts();
	const result = {};

	result["filePath"] = file === undefined ? globals.DEFAULT.PATH_TO_SAVE_FILE : file;
	result["specialCharacters"] = flags.specialCharacters === true;
	result["alphabetCount"] = parseInputNumber(flags.alphabetCount, globals.DEFAULT.ALPHABET_COUNT,
		alphabetCount => alphabetCount < 0 || alphabetCount > globals.ALPHABET.length ||
			(alphabetCount === 0 && !result["specialCharacters"]));
	result["numberOfLetters"] = parseInputNumber(flags.numberOfLetters, globals.DEFAULT.NUMBER_OF_LETTERS,
			numberOfLetters => numberOfLetters <= 0);
	result["depth"] = parseInputNumber(flags.depth, globals.DEFAULT.DEPTH, depth => depth <= 0);
	result["minimumChildren"] = parseInputNumber(flags.minimumChildren, globals.DEFAULT.MINIMUM_CHILDREN,
			minimumChildren => minimumChildren < 0);
	result["maximumChildren"] = parseInputNumber(flags.maximumChildren, Math.max(globals.DEFAULT.MAXIMUM_CHILDREN, result["minimumChildren"]),
			maximumChildren => maximumChildren < 0 || maximumChildren < result["minimumChildren"]);
	result["debug"] = flags.debug === true;
	result["print"] = flags.print === true;
	result["fullTree"] = flags.fullTree === true;

	return result;
}

program
	.name('jsonGenerator')
	.description('Generates JSON file for testing')
	.argument('[file]', `The absolute path to the file location to be saved`, globals.DEFAULT.PATH_TO_SAVE_FILE)
	.option('-a, --alphabet-count <number>', `The number of letters to use from the alphabet when generating node names (if this count is 0 and special characters are disable then putting default value for count instead)`, globals.DEFAULT.ALPHABET_COUNT)
	.option('-s, --no-special-characters', `To include the following special characters when generating node names: ${globals.SPECIAL_CHARACTERS.split('').map(c => `'${c}'`)}`)
	.option('-n, --number-of-letters <number>', `The total number of letters that each generated node name will have`, globals.DEFAULT.NUMBER_OF_LETTERS)
	.option('-d, --depth <number>', `The depth of the JSON tree`, globals.DEFAULT.DEPTH)
	.option('-m, --minimum-children <number>', `The minimum number of children each node should have (if the minimum is higher than the maximum, then the maximum will be raised)`, globals.DEFAULT.MINIMUM_CHILDREN)
	.option('-M, --maximum-children <number>', `The maximum number of children each node should have (if the maximum is lower than the minimum, then the maximum will be the maximum from default value and the current minimum)`, globals.DEFAULT.MAXIMUM_CHILDREN)
	.option('-f, --full-tree', `The resulting tree, will be a full tree, each node will have exactly the given number of minimum children`)
	.option('-D, --debug', `Turn on debug mode, for verbose prints`)
	.option('-P, --print', `Print the resulting JSON INSTEAD of saving it to a file`)
	.action((file) => {
		try {
			const inputs = parseInput(file);
			const {filePath, alphabetCount, specialCharacters, numberOfLetters,
				depth, minimumChildren, maximumChildren, debug, print,
				fullTree } = inputs;

			if (debug)
				console.log(`Input: ${JSON.stringify(inputs, null, 2)} `);

			const charactersPoll = `${specialCharacters ? globals.SPECIAL_CHARACTERS : ''}${globals.ALPHABET.substring(0, alphabetCount)}`;

			if (debug)
				console.log(`charactersPoll: ${charactersPoll}`);

			const json = generateJson(fullTree, charactersPoll, numberOfLetters, depth, minimumChildren, maximumChildren);

			if (print)
				console.log(JSON.stringify(json, null, 2));
			else
				fs.writeFileSync(filePath, JSON.stringify(json));
		} catch (error) {
			console.error(`Something went wrong: ${error}`);
			process.exit(1);
		}
	});

program.parse();
