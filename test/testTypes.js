const { ExtendLodash } = require('../src/utils/ExtendLodash');

const table = {};
const valuesToTest = {
	null: null,
	undefined: undefined,
	NaN: NaN,
	true: true,
	false: false,
	1: 1,
	"1.5": 1.5,
	abc: "abc",
	"[]": [],
	"{}": {}
};

Object.entries(valuesToTest).forEach(([key, value]) => {
	const tableEntry = {};

	tableEntry["isNull"] = value === null;
	tableEntry["isUndefined"] = value === undefined;
	// tableEntry["isNaN"] = isNaN(value);
	tableEntry["isBoolean"] = ExtendLodash.isBoolean(value);
	tableEntry["isLong"] = ExtendLodash.isLong(value);
	tableEntry["isDouble"] = ExtendLodash.isDouble(value);
	tableEntry["isString"] = ExtendLodash.isString(value);
	tableEntry["isArray"] = ExtendLodash.isArray(value);
	tableEntry["isObject"] = ExtendLodash.isObject(value);

	table[key] = tableEntry;
});
console.table(table);
