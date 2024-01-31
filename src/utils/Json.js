//#region Imports
// Node
const { inspect } = require('util');

// Project
const { ExtendLodash } = require('./ExtendLodash');
const { Randomizer } = require('./Randomizer');
//#endregion

// noinspection JSUnusedGlobalSymbols
class Json {

	static LEAF_JSON_TYPES = {
		null: 0,
		boolean: 1,
		long: 2,
		double: 3,
		string: 4
	};
	static NONE_LEAF_JSON_TYPES = {
		array: 5,
		object: 6
	};
	static JSON_TYPES = {
		...Json.LEAF_JSON_TYPES,
		...Json.NONE_LEAF_JSON_TYPES
	};
	static OTHER_TYPE = -1;

	static #ALPHABET = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz'.split('');

	constructor() {
		throw new Error('Private constructor has been accessed');
	}

	//#region Random JSON Types
	/**
	 * Generates a random leaf JSON type.
	 * @return {number} a random leaf JSON type.
	 */
	static getRandomLeafJsonType() {
		return Randomizer.getRandomValueFromObject(Json.LEAF_JSON_TYPES);
	}

	/**
	 * Generates a random none leaf JSON type.
	 * @return {number} a random none leaf JSON type.
	 */
	static getRandomNoneLeafJsonType() {
		return Randomizer.getRandomValueFromObject(Json.NONE_LEAF_JSON_TYPES);
	}

	/**
	 * Generates a random JSON type.
	 * @return {number} a random JSON type.
	 */
	static getRandomJsonType() {
		return Randomizer.getRandomValueFromObject(Json.JSON_TYPES);
	}

	/**
	 * Get a random type from the Json.JSON_TYPES array.
	 * @param {boolean} forceNoneLeafType If true, will return a random type from Json.NONE_LEAF_JSON_TYPES only.
	 * @return {number} A random type from Json.JSON_TYPES.
	 */
	static getRandomNodeType(forceNoneLeafType) {
		if (forceNoneLeafType)
			return Json.getRandomNoneLeafJsonType();
		else
			return Json.getRandomJsonType();
	}
	//#endregion

	/**
	 * Checks what is the type of the given element.
	 * @param {any} element The element to be checked.
	 * @return {number} The type of the element if it's object or array, otherwise return Json.OTHER_TYPE.
	 */
	static getNoneLeafType(element) {
		if (ExtendLodash.isObject(element))
			return Json.JSON_TYPES.object;
		else if (ExtendLodash.isArray(element))
			return Json.JSON_TYPES.array;
		else
			return Json.OTHER_TYPE;
	}

	/**
	 * Checks what is the type of the given element.
	 * @param {any} element The element to be checked.
	 * @return {number} The type of the element.
	 * @throws {Error} If the type is not JSON type.
	 */
	static getType(element) {
		if (ExtendLodash.isObject(element))
			return Json.JSON_TYPES.object;
		else if (ExtendLodash.isArray(element))
			return Json.JSON_TYPES.array;
		else if (ExtendLodash.isBoolean(element))
			return Json.JSON_TYPES.boolean;
		else if (ExtendLodash.isLong(element))
			return Json.JSON_TYPES.long;
		else if (ExtendLodash.isDouble(element))
			return Json.JSON_TYPES.double;
		else if (ExtendLodash.isString(element))
			return Json.JSON_TYPES.string;
		else
			throw new Error(`Invalid element type: ${inspect(element)}`);
	}

	/**
	 * Generates a random node value.
	 * @param {number} nodeType The type of the returning result.
	 * @return {null|boolean|number|string|any[]|object} Node value.
	 * @throws {Error} If invalid JSON type is given.
	 */
	static getRandomNodeValue(nodeType) {
		switch (nodeType) {
			case Json.JSON_TYPES.null:
				return null;
			case Json.JSON_TYPES.boolean:
				return Randomizer.getRandomBoolean();
			case Json.JSON_TYPES.long:
				return Randomizer.getRandomLong(-1_000_000_000, 1_000_000_000);
			case Json.JSON_TYPES.double:
				return Randomizer.getRandomDouble(-1_000_000_000, 1_000_000_000);
			case Json.JSON_TYPES.string: {
				const stringLength = Randomizer.getRandomLong(0, 32);
				let string = '';

				for (let count = 0; count < stringLength; ++count)
					string += Randomizer.getRandomValueFromArray(Json.#ALPHABET);

				return string;
			}
			case Json.JSON_TYPES.array:
				return [];
			case Json.JSON_TYPES.object:
				return {};
			default:
				throw new Error(`Invalid child type: ${nodeType}`);
		}
	}

}

module.exports = {
	Json
}
