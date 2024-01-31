// noinspection JSUnusedGlobalSymbols
class Randomizer {

	constructor() {
		throw new Error('Private constructor has been accessed');
	}

	/**
	 * Generates a random long in the given range.
	 * @param {number} minimum The minimum number of the range (inclusive).
	 * @param {number} maximum The maximum number of the range (inclusive).
	 * @return {number} A random long from the given range.
	 */
	static getRandomLong(minimum, maximum) {
		return Math.floor(Randomizer.getRandomDouble(minimum, maximum));
	}

	/**
	 * Generates a random double in the given range.
	 * @param {number} minimum The minimum number of the range (inclusive).
	 * @param {number} maximum The maximum number of the range (inclusive).
	 * @return {number} A random double from the given range.
	 */
	static getRandomDouble(minimum, maximum) {
		return (Math.random() * (maximum + 1 - minimum)) + minimum;
	}

	/**
	 * Get a random element from the given array.
	 * @param {any[]} array The array as poll.
	 * @return {any} A random element from the given array.
	 */
	static getRandomValueFromArray(array) {
		const index = Randomizer.getRandomLong(
			0,
			Math.max(array.length - 1, 0)
		);
		return array[index];
	}

	/**
	 * Get a random value from the given object.
	 * @param {object} object The object to poll from.
	 * @return {any} A random value from the given object.
	 */
	static getRandomValueFromObject(object) {
		const key = Randomizer.getRandomValueFromArray(Object.keys(object));
		return object[key];
	}

	/**
	 * Generates a random boolean.
	 * @return {boolean} A random boolean.
	 */
	static getRandomBoolean() {
		return Randomizer.getRandomLong(0, 1) === 0;
	}

}

module.exports = {
	Randomizer
}
