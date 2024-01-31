//#region Imports
const fs = require('fs');
//#endregion

// noinspection JSUnusedGlobalSymbols
class ExtendLodash {

	constructor() {
		throw new Error('Private constructor has been accessed');
	}

	//#region Types
	/**
	 * Checks if the given element is type null.
	 * @param {any} element The element to be tested.
	 * @return {boolean} If true, the element is type null.
	 */
	static isNull(element) {
		return element === null;
	}

	/**
	 * Checks if the given element is type undefined.
	 * @param {any} element The element to be tested.
	 * @return {boolean} If true, the element is type undefined.
	 */
	static isUndefined(element) {
		return element === undefined;
	}

	/**
	 * Checks if the given element is type null or undefined.
	 * @param {any} element The element to be tested.
	 * @return {boolean} If true, the element is type null or undefined.
	 */
	static isNullable(element) {
		return ExtendLodash.isNull(element) || ExtendLodash.isUndefined(element);
	}

	/**
	 * Checks if the given element is type boolean.
	 * @param {any} element The element to be tested.
	 * @return {boolean} If true, the element is type boolean.
	 */
	static isBoolean(element) {
		return typeof element === "boolean";
	}

	/**
	 * Checks if the given element is type long.
	 * @param {any} element The element to be tested.
	 * @return {boolean} If true, the element is type long.
	 */
	static isLong(element) {
		return Number.isInteger(element);
	}

	/**
	 * Checks if the given element is type double.
	 * @param {any} element The element to be tested.
	 * @return {boolean} If true, the element is type double.
	 */
	static isDouble(element) {
		return Number(element) === element && element && 1 !== 0;
	}

	/**
	 * Checks if the given element is type string.
	 * @param {any} element The element to be tested.
	 * @return {boolean} If true, the element is type string.
	 */
	static isString(element) {
		return typeof element === 'string' || element instanceof String;
	}

	/**
	 * Checks if the given element is type array.
	 * @param {any} element The element to be tested.
	 * @return {boolean} If true, the element is type array.
	 */
	static isArray(element) {
		return Array.isArray(element);
	}

	/**
	 * Checks if the given element is type object.
	 * @param {any} element The element to be tested.
	 * @return {boolean} If true, the element is type object.
	 */
	static isObject(element) {
		return Object.prototype.toString.call(element) === '[object Object]';
	}
	//#endregion

	/**
	 * Checks if file/directory exists.
	 * @param {string} path The path to the file/directory.
	 * @return {boolean} If true, then the file/directory exists.
	 */
	static isExists(path) {
		try {
			fs.statSync(path);
			return true;
		} catch (ignored) {
			return false;
		}
	}

}

module.exports = {
	ExtendLodash
}
