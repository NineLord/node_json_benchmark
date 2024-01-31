//#region Imports
// Project
const { Json } = require('../utils/Json');
const { Randomizer } = require('../utils/Randomizer');
//#endregion

class Generator {

	#charactersPoll; /** {string[]} Arrays of single characters. */
	#numberOfLetters; /** {number} Positive number showing the number of letters each node name should have. */
	#depth; /** {number} The depth of the JSON tree. */
	#minimumChildren; /** {number} The minimum number of children in each node. */
	#maximumChildren; /** {number} The maximum number of children in each node. */

	//#region Constructor
	/**
	 * Create an instance of this class.
	 * @param {string} charactersPoll None empty string of characters.
	 * @param {number} numberOfLetters Positive number showing the number of letters each node name should have.
	 * @param {number} depth The depth of the JSON tree.
	 * @param {number} minimumChildren The minimum number of children in each node.
	 * @param {number} maximumChildren The maximum number of children in each node.
	 */
	constructor(charactersPoll, numberOfLetters, depth, minimumChildren, maximumChildren) {
		this.#charactersPoll = charactersPoll.split('');
		this.#numberOfLetters = numberOfLetters;
		this.#depth = depth;
		this.#minimumChildren = minimumChildren;
		this.#maximumChildren = maximumChildren;
	}

	/**
	 * Generates a random JSON tree.
	 * @param {boolean} isFullTree If true, the generated tree will be full.
	 * @param {string} charactersPoll None empty string of characters.
	 * @param {number} numberOfLetters Positive number showing the number of letters each node name should have.
	 * @param {number} depth The depth of the JSON tree.
	 * @param {number} minimumChildren The minimum number of children in each node.
	 * @param {number} maximumChildren The maximum number of children in each node.
	 * @return {object} The generated JSON tree.
	 */
	static generateJson(isFullTree, charactersPoll, numberOfLetters, depth, minimumChildren, maximumChildren) {
		const generator = new Generator(charactersPoll, numberOfLetters, depth, minimumChildren, maximumChildren);
		if (isFullTree)
			return generator.generateFullTree();
		else
			return generator.generate();
	}
	//#endregion

	//#region Public API
	/**
	 * Generates a random JSON.
	 * @return {object} The generated JSON.
	 */
	generate() {
		const result = {};

		let currentNodes = [result]; /** {(any[]|object)[]} Array of empty objects / empty arrays, representing the current level of nodes. */
		let nextLevelNodes = []; /** {(any[]|object)[]} Array of empty objects / empty arrays, representing the next level of nodes. */

		for (let level = 0; level < this.#depth; ++level) {
			const mustHaveChildrenNodeIndex = Randomizer.getRandomLong(0, currentNodes.length - 1); // If until this node, there isn't a node with children, then this node will have children.

			for (let nodeIndex = 0; currentNodes.length !== 0 ; ++nodeIndex) {
				const currentNode = currentNodes.pop();
				const currentNodeType = Json.getNoneLeafType(currentNode);
				const isMustHaveChildren = nodeIndex === mustHaveChildrenNodeIndex && nextLevelNodes.length === 0;
				const numberOfChildren = this.#getNumberOfChildrenNodes(isMustHaveChildren);

				for (let nodeCount = 0; nodeCount < numberOfChildren; ++nodeCount) {
					const childNodeName = this.#getNodeName(currentNodeType, nodeCount);
					const childNodeType = Json.getRandomNodeType(isMustHaveChildren);
					const childNodeValue = Json.getRandomNodeValue(childNodeType);

					currentNode[childNodeName] = childNodeValue;
					switch (childNodeType) {
						case Json.JSON_TYPES.array:
						case Json.JSON_TYPES.object:
							nextLevelNodes.push(childNodeValue);
					}
				}
			}

			currentNodes = nextLevelNodes;
			nextLevelNodes = [];
		}

		return result;
	}

	/**
	 * Generates a random JSON.
	 * @return {object} The generated JSON.
	 */
	generateFullTree() {
		const result = {};

		let currentNodes = [result]; /** {(any[]|object)[]} Array of empty objects / empty arrays, representing the current level of nodes. */
		let nextLevelNodes = []; /** {(any[]|object)[]} Array of empty objects / empty arrays, representing the next level of nodes. */
		const lastLevel = this.#depth - 1;

		for (let level = 0; level < this.#depth; ++level) {

			while (currentNodes.length !== 0) {
				const currentNode = currentNodes.pop();
				const currentNodeType = Json.getNoneLeafType(currentNode);

				for (let nodeCount = 0; nodeCount < this.#minimumChildren; ++nodeCount) {
					const childNodeName = this.#getNodeName(currentNodeType, nodeCount);
					const childNodeType = level === lastLevel ? Json.getRandomLeafJsonType() : Json.getRandomNoneLeafJsonType();
					const childNodeValue = Json.getRandomNodeValue(childNodeType);

					currentNode[childNodeName] = childNodeValue;
					nextLevelNodes.push(childNodeValue);
				}
			}

			currentNodes = nextLevelNodes;
			nextLevelNodes = [];
		}

		return result;
	}
	//#endregion

	//#region Helper methods
	/**
	 * Generate a random number of children for a node.
	 * @param {boolean} forceHavingChildren If true, will force the result to be positive number.
	 * @return {number} Number of children for a node.
	 */
	#getNumberOfChildrenNodes(forceHavingChildren) {
		const randomNumberOfChildren = Randomizer.getRandomLong(this.#minimumChildren, this.#maximumChildren);
		return forceHavingChildren ? Math.max(randomNumberOfChildren, 1) : randomNumberOfChildren;
	}

	//#region Node Names
	/**
	 * Generate a random character for node name.
	 * @return {string} A random single character string.
	 */
	#getRandomNodeCharacter() {
		return Randomizer.getRandomValueFromArray(this.#charactersPoll);
	}

	/**
	 * Generate a random name for node.
	 * @return {string} A random string.
	 */
	#getRandomNodeName() {
		let result = '';
		for (let count = 0; count < this.#numberOfLetters; ++count)
			result += this.#getRandomNodeCharacter();

		return result;
	}

	/**
	 * Generate a node name or index depending on the type of node.
	 * @param {number} nodeType The type of the node.
	 * @param {number} nodeCount The index of the node.
	 * @return {string|number} A name for the node.
	 * @throws {Error} If the node type is none leaf JSON type.
	 */
	#getNodeName(nodeType, nodeCount) {
		switch (nodeType) {
			case Json.JSON_TYPES.array:
				return nodeCount;
			case Json.JSON_TYPES.object:
				return this.#getRandomNodeName();
			default:
				throw new Error(`Invalid node type: ${nodeType}`);
		}
	}
	//#endregion
	//#endregion

}

module.exports = {
	generateJson: Generator.generateJson
}
