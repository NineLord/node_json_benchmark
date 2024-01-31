class MathDataCollector {

	#min;
	#max;
	#sum;
	#count;

	constructor() {
		this.#min = undefined;
		this.#max = undefined;
		this.#sum = 0;
		this.#count = 0;
	}

	/**
	 * Adds a data point to the collector.
	 * @param {number} data The data to be added.
	 */
	add(data) {
		this.#sum += data;
		++this.#count;

		this.#min = this.#min === undefined ? data : Math.min(this.#min, data);
		this.#max = this.#max === undefined ? data : Math.max(this.#max, data);
	}

	/**
	 * Return the minimum data that was collected.
	 * @return {number|undefined} Undefined if no data was added, otherwise the minimum.
	 */
	get min() {
		return this.#min;
	}

	/**
	 * Return the maximum data that was collected.
	 * @return {number|undefined} Undefined if no data was added, otherwise the maximum.
	 */
	get max() {
		return this.#max;
	}

	/**
	 * Return the sum of all data that was collected.
	 * @return {number} The sum of the added data.
	 */
	get sum() {
		return this.#sum;
	}

	/**
	 * Return the count of data points that was collected.
	 * @return {number} The number of added data.
	 */
	get count() {
		return this.#count;
	}

	/**
	 * Return the average of the data that was collected.
	 * @return {number|undefined} Undefined if no data was added, otherwise the average.
	 */
	get average() {
		if (this.count === 0)
			return undefined;

		return this.sum / this.count;
	}

}

module.exports = {
	MathDataCollector
}
