//#region Imports
// 3rd Party
const ExcelJS = require('exceljs');
const { Worksheet, Cell } = require('exceljs');

// Project
const Reporter = require('./Reporter');
const { MathDataCollector } = require('../utils/MathDataCollector');
const { ExtendLodash } = require('../utils/ExtendLodash');
//#endregion

class ExcelGenerator {

	#workbook; /** {Workbook} The excel that being generated. */

	#averageGeneratingJsons;
	#averageIteratingJsonsIteratively;
	#averageIteratingJsonsRecursively;
	#averageDeserializingJsons;
	#averageSerializingJsons;

	#totalAverageCpu;
	#totalAverageRam;

	constructor() {
		this.#workbook = new ExcelJS.Workbook();

		this.#averageGeneratingJsons = new MathDataCollector();
		this.#averageIteratingJsonsIteratively = new MathDataCollector();
		this.#averageIteratingJsonsRecursively = new MathDataCollector();
		this.#averageDeserializingJsons = new MathDataCollector();
		this.#averageSerializingJsons = new MathDataCollector();

		this.#totalAverageCpu = new MathDataCollector();
		this.#totalAverageRam = new MathDataCollector();
	}

	//#region Adding data
	/**
	 * Creates a new worksheet with the given data.
	 * @param {string} worksheetName The name of the worksheet to be created.
	 * @param {object} database The data to be written in the given worksheet.
	 * @param {object[]} pcUsage The data about PC usage to be written in the given worksheet.
	 * @return {ExcelGenerator} The this instance of the class.
	 */
	appendWorksheet(worksheetName, database, pcUsage) {
		const worksheet = this.#workbook.addWorksheet(worksheetName, { views: [{ state: "frozen", ySplit: 1}] });
		ExcelGenerator.#generateTitles(worksheet);
		const dataCollectors = this.#addData(worksheet, database, pcUsage);
		ExcelGenerator.#addStyleToCells(worksheet, dataCollectors);
		ExcelGenerator.#resizeColumns(worksheet, 14);
		return this;
	}

	/**
	 * Generates the constant titles of the worksheet.
	 * @param {Worksheet} worksheet The worksheet that going to gain the titles.
	 */
	static #generateTitles(worksheet) {
		// deltaCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: '649B3F' } };

		//#region Column 1
		//#region Table 1
		const titleCell = worksheet.getCell(1,1);
		titleCell.value = 'Title';

		const generatingJsonCell = worksheet.getCell(2,1);
		generatingJsonCell.value = 'Generating JSON';

		const iteratingJsonIterativelyCell = worksheet.getCell(3, 1);
		iteratingJsonIterativelyCell.value = 'Iterating JSON Iteratively - BFS';

		const iteratingJsonRecursivelyCell = worksheet.getCell(4, 1);
		iteratingJsonRecursivelyCell.value = 'Iterating JSON Recursively - DFS';

		const deserializingJsonCell = worksheet.getCell(5, 1);
		deserializingJsonCell.value = 'Deserializing JSON';

		const serializingJsonCell = worksheet.getCell(6, 1);
		serializingJsonCell.value = 'Serializing JSON';

		const totalCell = worksheet.getCell(7, 1);
		totalCell.value = 'Total';
		//#endregion

		//#region Table 2
		const averageCpuCell = worksheet.getCell(9, 1);
		averageCpuCell.value = 'Average CPU (%)';

		const averageRamCell = worksheet.getCell(10, 1);
		averageRamCell.value = 'Average RAM (MB)';
		//#endregion
		//#endregion

		//#region Column 2
		const timeCell = worksheet.getCell(1,2);
		timeCell.value = 'Time (ms)';
		//#endregion

		//#region Column 4
		const cpuCell = worksheet.getCell(1,4);
		cpuCell.value = 'CPU (%)';
		//#endregion

		//#region Column 5
		const ramCell = worksheet.getCell(1,5);
		ramCell.value = 'RAM (MB)';
		//#endregion
	}

	/**
	 * Adds the data to the given worksheet.
	 * @param {Worksheet} worksheet the worksheet that going to gain the data.
	 * @param {Object} database The data to be added.
	 * @param {object[]} pcUsage The data about PC usage to be added.
	 * @return {{columnCpuUsage: MathDataCollector, columnRamUsage: MathDataCollector}} The data collectors of the columns with data.
	 */
	#addData(worksheet, database, pcUsage) {
		const rowTotal = new MathDataCollector();
		const columnCpuUsage = new MathDataCollector();
		const columnRamUsage = new MathDataCollector();

		//#region JSON Manipulations
		const generateJson = database[Reporter.GENERATE_JSON];
		worksheet.getCell(2, 2).value = generateJson;
		this.#averageGeneratingJsons.add(generateJson);
		rowTotal.add(generateJson);

		const iterateIteratively = database[Reporter.ITERATE_ITERATIVELY];
		worksheet.getCell(3, 2).value = iterateIteratively;
		this.#averageIteratingJsonsIteratively.add(iterateIteratively);
		rowTotal.add(iterateIteratively);

		const iterateRecursively = database[Reporter.ITERATE_RECURSIVELY];
		worksheet.getCell(4, 2).value = iterateRecursively;
		this.#averageIteratingJsonsRecursively.add(iterateRecursively);
		rowTotal.add(iterateRecursively);

		const deserializeJson = database[Reporter.DESERIALIZE_JSON];
		worksheet.getCell(5, 2).value = deserializeJson;
		this.#averageDeserializingJsons.add(deserializeJson);
		rowTotal.add(deserializeJson);

		const serializeJson = database[Reporter.SERIALIZE_JSON];
		worksheet.getCell(6, 2).value = serializeJson;
		this.#averageSerializingJsons.add(serializeJson);
		rowTotal.add(serializeJson);

		worksheet.getCell(7, 2).value = rowTotal.sum;
		//#endregion

		//#region PC Usage
		let currentRow = 2;
		pcUsage.forEach(({ [Reporter.PC_USAGE_CPU]: cpu, [Reporter.PC_USAGE_RAM]: ram }) => {
			if (ExtendLodash.isLong(cpu)) {
				worksheet.getCell(currentRow, 4).value = cpu;
				columnCpuUsage.add(cpu);
				this.#totalAverageCpu.add(cpu);
			}

			worksheet.getCell(currentRow, 5).value = ram;
			columnRamUsage.add(ram);
			this.#totalAverageRam.add(ram);

			++currentRow;
		});

		worksheet.getCell(9, 2).value = columnCpuUsage.average;
		worksheet.getCell(10, 2).value = columnRamUsage.average;
		//#endregion

		return { columnCpuUsage, columnRamUsage };
	}

	/**
	 * Iterate range in a worksheet.
	 * @param {Worksheet} worksheet The worksheet that going to be iterated (inclusive).
	 * @param {number} startRow The start row of the area to be iterated (inclusive).
	 * @param {number} startColumn The start column of the area to be iterated (inclusive).
	 * @param {number} finishRow The end row of the area to be iterated (inclusive).
	 * @param {number} finishColumn The end column of the area to be iterated (inclusive).
	 * @param {function(cell: Cell, rowNumber: number, columnNumber: number): void} callback A method to be call for each cell in the area.
	 */
	static #forEachCell(worksheet, startRow, startColumn, finishRow, finishColumn, callback) {
		for (let rowNumber = startRow; rowNumber <= finishRow; ++rowNumber) {
			for (let columnNumber = startColumn; columnNumber <= finishColumn; ++columnNumber)
				callback(worksheet.getCell(rowNumber, columnNumber), rowNumber, columnNumber);
		}
	}

	static #convertColumnKeyToIndexLetter(number) {
		let result = "", temp;

		while (number > 0) {
			temp = (number - 1) % 26;
			result = String.fromCharCode(temp + 65) + result;
			number = (number - temp - 1) / 26;
		}
		return result;
	}

	/**
	 * Adds styles to the cells.
	 * @param {Worksheet} worksheet The worksheet that going to gain the some style!
	 * @param {{
	 * columnRuntimeOfGettingAllTopics: MathDataCollector,
	 * columnRuntimeOfRouteInTree: MathDataCollector,
	 * columnRuntimeOfCalculatingRoutes: MathDataCollector,
	 * columnRuntimeOfInMemoryQuery: MathDataCollector,
	 * columnCpuUsage: MathDataCollector,
	 * columnRamUsage: MathDataCollector }} The columns data collectors.
	 */
	static #addStyleToCells(worksheet, { columnCpuUsage, columnRamUsage }) {
		ExcelGenerator.#forEachCell(worksheet, 1, 1, 7, 2, cell => {
			cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
		});

		ExcelGenerator.#forEachCell(worksheet, 9, 1, 10, 2, cell => {
			cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
		});

		ExcelGenerator.#forEachCell(worksheet, 1, 4, worksheet.lastRow.number, 5, cell => {
			cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
		});

		ExcelGenerator.#forEachCell(worksheet, 1, 1, 1, 5, cell => {
			cell.alignment = { horizontal: "center", vertical: "middle" };
		});

		ExcelGenerator.#forEachCell(worksheet, 2, 2, worksheet.lastRow.number, 5, cell => {
			cell.alignment = { horizontal: "center", vertical: "middle" };
		});

		const columnNumberToDataCollector = new Map();
		columnNumberToDataCollector.set(4, columnCpuUsage);
		columnNumberToDataCollector.set(5, columnRamUsage);
		columnNumberToDataCollector.forEach((dataCollector, columnNumber) => {
			const columnLetter = ExcelGenerator.#convertColumnKeyToIndexLetter(columnNumber);
			worksheet.addConditionalFormatting({
				ref: `${columnLetter}2:${columnLetter}${worksheet.lastRow.number}`,
				rules: [
					{
						type: 'colorScale',
						cfvo: [{ type: 'num', value: dataCollector.min }, { type: 'num', value: dataCollector.average }, { type: 'num', value: dataCollector.max }],
						color: [
							{ argb: '63BE7B' },
							{ argb: 'FFEB84' },
							{ argb: 'F8696B' }
						]
					}
				]
			})
		});
	}

	/**
	 * Resize the columns to have readable length.
	 * @param {Worksheet} workSheet
	 * @param {number} minimumColumnWidth
	 */
	static #resizeColumns(workSheet, minimumColumnWidth) {
		workSheet.columns.forEach(column => {
			let maxLength = minimumColumnWidth;
			column.eachCell(cell => {
				if (cell === cell.master) {
					const longestLine = cell.text.split('\n').reduce((accumulator, current) => Math.max(accumulator, current.length), 0);
					maxLength = Math.max(maxLength, longestLine + 2);
				}
			});
			column.width = maxLength;
		});
	}
	//#endregion

	//#region Add summary worksheet
	#addAverageWorksheet() {
		const worksheet = this.#workbook.addWorksheet('Average');
		ExcelGenerator.#generateAverageTitles(worksheet);
		this.#addAverageData(worksheet);
		ExcelGenerator.#addAverageStyleToCells(worksheet);
		ExcelGenerator.#resizeColumns(worksheet, 14);
	}

	/**
	 * Generates the constant titles of the worksheet.
	 * @param {Worksheet} worksheet The worksheet that going to gain the titles.
	 */
	static #generateAverageTitles(worksheet) {
		//#region Column 1
		//#region Table 1
		const titleCell = worksheet.getCell(1,1);
		titleCell.value = 'Title';

		const generatingJsonCell = worksheet.getCell(2,1);
		generatingJsonCell.value = 'Average Generating JSONs';

		const iteratingJsonIterativelyCell = worksheet.getCell(3, 1);
		iteratingJsonIterativelyCell.value = 'Average Iterating JSONs Iteratively - BFS';

		const iteratingJsonRecursivelyCell = worksheet.getCell(4, 1);
		iteratingJsonRecursivelyCell.value = 'Average Iterating JSONs Recursively - DFS';

		const deserializingJsonCell = worksheet.getCell(5, 1);
		deserializingJsonCell.value = 'Average Deserializing JSONs';

		const serializingJsonCell = worksheet.getCell(6, 1);
		serializingJsonCell.value = 'Average Serializing JSONs';

		const totalCell = worksheet.getCell(7, 1);
		totalCell.value = 'Average Totals';
		//#endregion

		//#region Table 2
		const averageCpuCell = worksheet.getCell(9, 1);
		averageCpuCell.value = 'Average Total CPU (%)';

		const averageRamCell = worksheet.getCell(10, 1);
		averageRamCell.value = 'Average Total RAM (MB)';
		//#endregion
		//#endregion

		//#region Column 2
		const timeCell = worksheet.getCell(1,2);
		timeCell.value = 'Time (ms)';
		//#endregion
	}

	/**
	 * Adds data to the average worksheet.
	 * @param {Worksheet} worksheet The worksheet to gain data.
	 */
	#addAverageData(worksheet) {
		const totalAverages = new MathDataCollector();

		const cells = new Map();
		cells.set(2, this.#averageGeneratingJsons.average);
		cells.set(3, this.#averageIteratingJsonsIteratively.average);
		cells.set(4, this.#averageIteratingJsonsRecursively.average);
		cells.set(5, this.#averageDeserializingJsons.average);
		cells.set(6, this.#averageSerializingJsons.average);
		cells.forEach((average, cellRow) => {
			worksheet.getCell(cellRow,2).value = average;
			totalAverages.add(average);
		})
		worksheet.getCell(7,2).value = totalAverages.sum;

		worksheet.getCell(9,2).value = this.#totalAverageCpu.average;
		worksheet.getCell(10,2).value = this.#totalAverageRam.average;
	}

	/**
	 * Adds styles to the cells.
	 * @param {Worksheet} worksheet The worksheet that going to gain the some style!
	 */
	static #addAverageStyleToCells(worksheet) {
		ExcelGenerator.#forEachCell(worksheet, 1, 1, 7, 2, cell => {
			cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
		});

		ExcelGenerator.#forEachCell(worksheet, 9, 1, 10, 2, cell => {
			cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
		});

		ExcelGenerator.#forEachCell(worksheet, 1, 1, 1, 2, cell => {
			cell.alignment = { horizontal: "center", vertical: "middle" };
		});

		ExcelGenerator.#forEachCell(worksheet, 2, 2, worksheet.lastRow.number, 2, cell => {
			cell.alignment = { horizontal: "center", vertical: "middle" };
		});
	}
	//#endregion

	//#region Add about worksheet
	/**
	 * Creates about worksheet with the test input parameters.
	 * @param {string} jsonPath The Path to the JSON file that was tested on.
	 * @param {number} sampleInterval The sampling rate that the PC was sampled at.
	 * @param {number} numberOfLetters The number of letters the generating JSON had to create in each node.
	 * @param {number} depth The depth of the tree that the generating JSON had to create.
	 * @param {number} minimumChildren The minimum number of children nodes the generating JSON had to create.
	 */
	#createAboutWorksheet(jsonPath, sampleInterval, numberOfLetters, depth, minimumChildren) {
		const worksheet = this.#workbook.addWorksheet('About');

		worksheet.getCell(1,1).value = 'Path to JSON to be tested on (Iterating/Deserializing/Serializing)';
		worksheet.getCell(1,2).value = jsonPath;

		worksheet.getCell(2,1).value = 'CPU/RAM Sampling Interval (milliseconds)';
		worksheet.getCell(2,2).value = sampleInterval;

		worksheet.getCell(3,1).value = 'Number of letters to generate for each node in the generated JSON tree';
		worksheet.getCell(3,2).value = numberOfLetters;

		worksheet.getCell(4,1).value = 'Depth of the generated JSON tree';
		worksheet.getCell(4,2).value = depth;

		worksheet.getCell(5,1).value = 'Number of children each node in the generated JSON tree going to have';
		worksheet.getCell(5,2).value = minimumChildren;

		ExcelGenerator.#forEachCell(worksheet, 1, 1, 5, 2, cell => {
			cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
		});

		ExcelGenerator.#forEachCell(worksheet, 1, 2, 5, 2, cell => {
			cell.alignment = { horizontal: "center", vertical: "middle" };
		});

		ExcelGenerator.#resizeColumns(worksheet, 14);
	}
	//#endregion

	/**
	 * Saves the generated excel to file.
	 * @param {string} pathToFile The path to the file to create.
	 * @param {string} jsonPath The Path to the JSON file that was tested on.
	 * @param {number} sampleInterval The sampling rate that the PC was sampled at.
	 * @param {number} numberOfLetters The number of letters the generating JSON had to create in each node.
	 * @param {number} depth The depth of the tree that the generating JSON had to create.
	 * @param {number} minimumChildren The minimum number of children nodes the generating JSON had to create.
	 * @return {ExcelGenerator} The this instance of the class.
	 */
	async saveAs(pathToFile, jsonPath, sampleInterval, numberOfLetters, depth, minimumChildren) {
		this.#addAverageWorksheet();
		this.#createAboutWorksheet(jsonPath, sampleInterval, numberOfLetters, depth, minimumChildren);
		await this.#workbook.xlsx.writeFile(pathToFile);
		return this;
	}
}

module.exports = {
	ExcelGenerator
}
