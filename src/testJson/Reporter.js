//#region Imports
// Project
const TestRecorder = require('../utils/TestRecorder');
//#endregion

class Reporter {

	static DATABASE_GENERATE_JSON = "generateJson";
	static DATABASE_DESERIALIZE_JSON = "deserializeJson";
	static DATABASE_ITERATE_ITERATIVELY = "iterateIteratively";
	static DATABASE_ITERATE_RECURSIVELY = "iterateRecursively";
	static DATABASE_SERIALIZE_JSON = "serializeJson";

	static DATABASE_PC_USAGE_CPU_FIELD = 'cpu';
	static DATABASE_PC_USAGE_RAM_FIELD = 'ram';

	#testRecorder; /** {TestRecorder} the TestRecorder singleton instance. */
	#database;

	constructor() {
		this.#testRecorder = TestRecorder.instance;
		this.#testRecorder.start(this.#handleMeasure.bind(this));
		this.#database = {};
	}

	/**
	 * Cleans up the reporter to be ready to record again.
	 */
	clear() {
		this.#testRecorder.clear();
		this.#testRecorder.start(this.#handleMeasure.bind(this));
		this.#database = {};
	}

	//#region Database
	/**
	 * Return the field from the given data structure,
	 * if doesn't exists, initialize it with default value first.
	 * @param {object} dataStructure An object.
	 * @param {string} fieldName A field in the object.
	 * @param {any} defaultValue The default value if the field doesn't exist.
	 * @return {any} The value from the given field of the object.
	 */
	static #getField(dataStructure, fieldName, defaultValue = {}) {
		if (!dataStructure.hasOwnProperty(fieldName))
			dataStructure[fieldName] = defaultValue;

		return dataStructure[fieldName];
	}
	//#endregion

	//#region Generic Measurement
	/**
	 * Handles when new measure data comes in.
	 * @param {string} measureId The unique ID of measurement.
	 * @param {number} duration The duration of the measurement.
	 */
	#handleMeasure(measureId, duration) {
		const { startMarkId, finishMarkId } = TestRecorder.getMeasureIdComponents(measureId);
		const startMarkName = TestRecorder.getMarkIdComponents(startMarkId).markName;
		const finishMarkName = TestRecorder.getMarkIdComponents(finishMarkId).markName;

		if (startMarkName !== finishMarkName)
			throw new Error(`Measuring unexpected marks: measureId=${measureId}`);

		switch (startMarkName) {
			case Reporter.DATABASE_GENERATE_JSON:
			case Reporter.DATABASE_DESERIALIZE_JSON:
			case Reporter.DATABASE_ITERATE_ITERATIVELY:
			case Reporter.DATABASE_ITERATE_RECURSIVELY:
			case Reporter.DATABASE_SERIALIZE_JSON:
				this.#database[startMarkName] = duration;
				break;
			default:
				throw new Error(`Unknown measure type: startMarkName=${startMarkName} ; measureId=${measureId}`);
		}
	}

	/**
	 * Starts to measure the generating JSON.
	 * @param {string} measurementType The type of measurement.
	 * @return {string} The unique ID of the marked lined.
	 */
	startMeasuring(measurementType) {
		return this.#testRecorder.startMeasuring(measurementType);
	}

	/**
	 * Finishes the measuring of generating JSON.
	 * @param {string} startMeasureId The marked line that the generating JSON has started at.
	 * @param {string} measurementType The type of measurement.
	 * @return {string} The measurement ID of this measurement.
	 */
	finishMeasuring(startMeasureId, measurementType) {
		return this.#testRecorder.finishMeasuring(
			startMeasureId,
			measurementType
		).measureId;
	}
	//#endregion

	/**
	 * Return a JSON representing the data collected by the reporter.
	 * @return {{database: object, pcUsage: object[]}} The reporter's database.
	 */
	toJSON() {
		return this.#database;
	}
}

module.exports = {
	reporter: new Reporter(),
	GENERATE_JSON: Reporter.DATABASE_GENERATE_JSON,
	DESERIALIZE_JSON: Reporter.DATABASE_DESERIALIZE_JSON,
	ITERATE_ITERATIVELY: Reporter.DATABASE_ITERATE_ITERATIVELY,
	ITERATE_RECURSIVELY: Reporter.DATABASE_ITERATE_RECURSIVELY,
	SERIALIZE_JSON: Reporter.DATABASE_SERIALIZE_JSON,

	PC_USAGE_CPU: Reporter.DATABASE_PC_USAGE_CPU_FIELD,
	PC_USAGE_RAM: Reporter.DATABASE_PC_USAGE_RAM_FIELD
}
