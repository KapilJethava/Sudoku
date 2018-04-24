import * as _ from 'lodash';
export class Entry {
	row: number;
	column: number;
	value: any;
	possibility: Array<number>;
	squareNo: number;

	constructor(row, column, value = '', possibility = []) {
		this.row = row;
		this.column = column;
		this.value = value;
		this.squareNo = (Math.floor(column / 3) + 1) + (Math.floor(row / 3) * 3);
		this.possibility = (possibility.length == 0) ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : possibility;
	}

	setPossibilities(data) {
		const squareNo = this.squareNo;
		const squareValues = _.reduce(data, function (result, row) {
			const subresult = _.reduce(row, function (result1, cell) {
				if (cell.squareNo === squareNo && cell.value != "") {
					result1.push(+cell.value);
				}
				return result1;
			}, []);
			return _.concat(result, subresult);
		}, []);
		console.log(squareValues);
		return squareValues;
	}
}
