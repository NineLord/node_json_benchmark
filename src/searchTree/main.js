//#region Imports
// 3rd Party
const { program } = require('commander');

// Project
const { breadthFirstSearch } = require('./breadthFirstSearch');
const { depthFirstSearch } = require('./depthFirstSearch');
//#endregion

const globals = {
	searchAlgorithms: {
		bfs: 'Breadth First Search',
		dfs: 'Depth First Search'
	}
};

program
	.name('searchTree')
	.description('Searches a given JSON tree for a value, returns true if the value was found in the tree')
	.argument('<tree>', `The JSON tree to be searched`)
	.argument('<value>', `The value to be searched in the tree`)
	.option('-t, --search-type <type>', `The type of search algorithm, valid ones: 'bfs' (stands for 'Breadth First Search'), 'dfs' (stands for 'Depth First Search')`, 'bfs')
	.action((tree, value) => {
		tree = JSON.parse(tree);
		try { value = JSON.parse(value); } catch (ignored) {}

		const flags = program.opts();

		if (flags.searchType === 'bfs')
			console.log(breadthFirstSearch(tree, value));
		else if (flags.searchType === 'dfs')
			console.log(depthFirstSearch(tree, value));
		else {
			console.error(`Invalid search type: ${flags.searchType}`);
			process.exit(1);
		}
	});

program.parse();
