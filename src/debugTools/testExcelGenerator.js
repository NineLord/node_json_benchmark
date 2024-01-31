const { resolve } = require('path');
const fs = require('fs');
const { ExcelGenerator } = require('../testJson/ExcelGenerator');

const relativePathToInputFiles = '../../junk';
const excelGenerator = new ExcelGenerator();

for (let testCount = 1; testCount <= 2; ++testCount) {
	const input = JSON.parse(fs.readFileSync(resolve(__dirname, `${relativePathToInputFiles}/test${testCount}.json`)).toString());
	excelGenerator.appendWorksheet(`Test ${testCount}`, input.database, input.pcUsage);
}

excelGenerator.saveAs(resolve(__dirname, '../../junk/excel.xlsx'),
	"/PATH/TO/Input/hugeJson_numberOfLetters8_depth10_children5.json",
	10, 8, 10, 5, 5);
