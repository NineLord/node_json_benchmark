//#region Imports
// Project
const { Json } = require('../utils/Json');
//#endregion

/**
 * Searches the given JSON tree for the given value.
 * @param {null|boolean|number|string|any[]|object} node The JSON tree to be searched.
 * @param {null|boolean|number|string} value The JSON value to be searched.
 * @return {boolean} If true, the value was found in the tree.
 */
function depthFirstSearch(node, value) {
	switch (Json.getNoneLeafType(node)) {
		case Json.JSON_TYPES.object: {
			for (const [nodeKey, nodeValue] of Object.entries(node)) {
				if (nodeKey === value || depthFirstSearch(nodeValue, value))
					return true;
			}
			break;
		}
		case Json.JSON_TYPES.array: {
			for (const nodeValue of node) {
				if (depthFirstSearch(nodeValue, value))
					return true;
			}
			break;
		}
		case Json.OTHER_TYPE: {
			if (node === value)
				return true;
			break;
		}
		default:
			throw new Error(`Invalid node type: ${node}`);
	}

	return false;
}

module.exports = {
	depthFirstSearch
}
