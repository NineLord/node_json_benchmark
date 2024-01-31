//#region Imports
// Project
const { Json } = require('../utils/Json');
const { ExtendLodash } = require('../utils/ExtendLodash');
//#endregion

/**
 * Searches the given JSON tree for the given value.
 * @param {object} tree The JSON tree to be searched.
 * @param {null|boolean|number|string} value The JSON value to be searched.
 * @return {boolean} If true, the value was found in the tree.
 */
function breadthFirstSearch(tree, value) {

	let currentNodes = [tree]; /** {(any[]|object)[]} Array of nodes from the current level in the tree. */
	let nextLevelNodes = []; /** {(any[]|object)[]} Array nodes from the next level in the tree. */
	const isValueString = ExtendLodash.isString(value);

	while (currentNodes.length !== 0) {
		const currentNode = currentNodes.pop();

		switch (Json.getNoneLeafType(currentNode)) {
			case Json.JSON_TYPES.object: {
				if (isValueString) {
					for (const nodeKey of Object.keys(currentNode)) {
						if (nodeKey === value)
							return true;
					}
				}
				nextLevelNodes.push(Object.values(currentNode));
				break;
			}
			case Json.JSON_TYPES.array: {
				nextLevelNodes.push(...currentNode);
				break;
			}
			case Json.OTHER_TYPE: {
				if (currentNode === value)
					return true;
				break;
			}
			default:
				throw new Error(`Invalid node type: ${currentNode}`);
		}

		if (currentNodes.length === 0) {
			currentNodes = nextLevelNodes;
			nextLevelNodes = [];
		}
	}

	return false;
}

module.exports = {
	breadthFirstSearch
}
