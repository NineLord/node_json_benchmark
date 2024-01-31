//#region Imports
// Node
const { parentPort, workerData } = require('worker_threads');
const _os = require('os');

// 3rd Party
const os = require('os-utils');

// Project
const Reporter = require('../Reporter');
//#endregion

const { sampleInterval } = workerData;

function getCpuInfo() {
	const cpus = _os.cpus();

	let user = 0;
	let nice = 0;
	let sys = 0;
	let idle = 0;
	let irq = 0;

	for (const cpu in cpus) {
		user	+= cpus[cpu].times.user;
		nice	+= cpus[cpu].times.nice;
		sys		+= cpus[cpu].times.sys;
		irq		+= cpus[cpu].times.irq;
		idle	+= cpus[cpu].times.idle;
	}

	const total = user + nice + sys + idle + irq;

	return { idle, total };
}

let previousCpuInfo = getCpuInfo();

setInterval(() => {
	const currentCpuInfo = getCpuInfo();
	const cpuPercentage = (currentCpuInfo.idle - previousCpuInfo.idle) / (currentCpuInfo.total - previousCpuInfo.total);
	previousCpuInfo = currentCpuInfo;

	parentPort.postMessage({
		[Reporter.PC_USAGE_CPU]: Math.round(cpuPercentage * 100),
		[Reporter.PC_USAGE_RAM]: Math.round((process.memoryUsage().rss / 1024) / 1024)
	});
}, sampleInterval);
