import { Component } from '@angular/core';
import * as _ from 'lodash';
import { Entry } from './Entry';
import { SquareMatrix } from './SquareMatrix';
import { Subject } from 'rxjs/Subject';
import { testData } from './testData';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'app';
	data = [];
	counter = 0;
	subject = new Subject<any>();
	retry = new Subject<any>();
	show = false;
	lastSet = [];
	debug = false;
	attempt = 1;

	constructor() {
		if (this.debug) {
			this.data = _.cloneDeep(testData);
			this.counter = _.filter(_.flatMap(this.data, (r) => r), (entry) => entry.value != '').length;
		}
		else {
			this.reset();
		}

		this.subject.subscribe(({ row, column, value }) => {
			this.data[row][column].value = value;
			this.resetPossiblity(row, column);
			if (this.lastSet.length == 3) {
				//remove last one
				this.lastSet.splice(2, 1);
			}
			this.lastSet.unshift({ row, column })

			if (this.counter < 81) {
				setTimeout(() => {
					this.startSolving();
				}, 200);
			} else {
				this.lastSet.splice(0, 3);
				this.show = true;
			}
		}, (err) => console.log(err));

		this.retry.subscribe(() => {
			if (this.attempt < 100) {
				setTimeout(() => {
					this.startSolving();
				}, 200);
			}
			console.log("Attempt => ", this.attempt);
			this.attempt++;
		}, (err) => console.log(err))
	}

	startSolving = () => {
		if (this.counter == 0) {
			alert("Entries required!");
			return;
		}
		//Level 1 resolving
		for (let i = 0;i < 9;i++) {
			for (let j = 0;j < 9;j++) {
				if (this.data[i][j].possibility.length === 1) {
					this.subject.next({ row: i, column: j, value: this.data[i][j].possibility[0] });
					return;
				}
			}
		}
		//this.show = true;
		this.level2Solving();
	}

	level2Solving = () => {
		// console.log("second level resolving started");
		var data = _.flatMap(this.data, (row) => row);
		var arr = [];
		var reIterationRequired = false;
		for (let value = 1;value < 10;value++) {
			for (let i = 0;i < 9;i++) {
				// For Row
				arr = _.filter(this.data[i], (cell) => cell.possibility.includes(value));
				if (arr.length == 1) {
					this.subject.next({ row: arr[0].row, column: arr[0].column, value: value });
					// console.log("Row Resolved=>", arr, value);
					return;
				} else if (arr.length > 0) {
					// if all the array element has same square num then remove that value from possibility array of other square cells
					let sqNo = arr[0].squareNo;
					let filtered = _.filter(arr, (val) => val.squareNo == sqNo);
					if (filtered.length == arr.length) {
						filtered = _.filter(data, (entry) => entry.row != i && entry.squareNo == sqNo && entry.possibility.includes(value))
						_.forEach(filtered, (entry) => {
							let index = entry.possibility.indexOf(value);
							entry.possibility.splice(index, 1);
						});
					}
				}
			}

			for (let i = 0;i < 9;i++) {
				// For column
				arr = _.filter(data, (cell) => cell.column == i && cell.possibility.includes(value));
				if (arr.length == 1) {
					this.subject.next({ row: arr[0].row, column: arr[0].column, value: value });
					// console.log("Column Resolved=>", arr, value);
					return;
				} else if (arr.length > 0) {
					// check weather some column in array is assumed to have some specific values? if so then other cells of that square should not have that value as possibility
					let sqNo = arr[0].squareNo;
					let filtered = _.filter(arr, (val) => val.squareNo == sqNo);
					if (filtered.length == arr.length) {
						filtered = _.filter(data, (entry) => entry.column != i && entry.squareNo == sqNo && entry.possibility.includes(value))
						_.forEach(filtered, (entry) => {
							let index = entry.possibility.indexOf(value);
							entry.possibility.splice(index, 1);
						});
						reIterationRequired = true;
					}
				}
			}

			for (let i = 1;i < 10;i++) {
				// For square
				arr = _.filter(data, (cell) => cell.squareNo == i && cell.possibility.includes(value));
				if (arr.length == 1) {
					this.subject.next({ row: arr[0].row, column: arr[0].column, value: value });
					// console.log("Square Resolved=>", arr, value);
					return;
				}
			}
		}
		this.level3Solving(data);
	};

	level3Solving = (data) => {
		data = _.filter(data, (entry) => entry.value == '');

		const resetEntries = (entityId, propName) => {
			var entityArr = _.filter(data, (entry) => entry[propName] == entityId);
			for (let j = 0;j < entityArr.length;j++) {
				var arr = _.filter(entityArr, (entry) => _.isEqual(entityArr[j].possibility, entry.possibility));
				if (arr.length > 1 && arr.length == arr[0].possibility.length) {
					console.log("found in "+ propName +"=>", arr);
					let filtered = _.filter(entityArr, (entry) => !arr.includes(entry));
					console.log("filtered in " + propName +  "=>", filtered);
					_.forEach(arr[0].possibility, (value) => {
						_.forEach(filtered, (entry) => {
							let index = entry.possibility.indexOf(value);
							if (index > -1) {
								entry.possibility.splice(index, 1);
							}
						});
					});
				}
			}
		}
		for (let i = 0;i < 9;i++) {
			resetEntries((i + 1), 'squareNo');
			resetEntries(i, 'row');
			resetEntries(i, 'column');
		}
		this.retry.next();
		alert("Its seems like you have entered very less entries to resolve, please reset and provide more entries to resolve this sudoku.");
	}
	validateEntry = (e, row, colm) => {
		const keyCode = e.which || e.keyCode;
		const entry = this.data[row][colm];
		const value = +e.key;
		if (keyCode < 48 || keyCode > 57) {
			alert('Only numeric value is allowed.');
			return false;
		}

		var data = _.flatMap(this.data, (rw) => rw);
		var arr = _.filter(this.data[row], (cell) => cell.value == value);
		if (arr.length > 0) {
			alert('Same row already has an entry of ' + value + '.');
			return false;
		}

		arr = _.filter(data, (cell) => cell.column == colm && cell.value == value);
		if (arr.length > 0) {
			alert('Same column already has an entry of ' + value + '.');
			return false;
		}

		arr = _.filter(data, (cell) => cell.squareNo == entry.squareNo && cell.value == value);
		if (arr.length > 0) {
			alert('Same square already has an entry of ' + value + '.');
			return false;
		}
		entry.userEntered = true;
		return true;
	};

	resetPossiblity = (row, column) => {
		const squareNum = this.data[row][column].squareNo;
		var value;
		var possibility = [], index = -1;

		if (this.data[row][column].value != "") {
			this.counter++;
			value = +this.data[row][column].value;
			_.forEach(this.data[row], (entry) => {
				index = entry.possibility.indexOf(value);
				if (index > -1) {
					entry.possibility.splice(index, 1);
				}
			});

			_.forEach(this.data, (row) => {
				index = row[column].possibility.indexOf(value);
				if (index != -1) {
					row[column].possibility.splice(index, 1);
				}
			});

			for (let i = SquareMatrix[squareNum].minRow;i < SquareMatrix[squareNum].maxRow;i++) {
				for (let j = SquareMatrix[squareNum].minCol;j < SquareMatrix[squareNum].maxCol;j++) {
					index = this.data[i][j].possibility.indexOf(value);
					if (index != -1) {
						this.data[i][j].possibility.splice(index, 1);
					}
				}
			}
			this.data[row][column].possibility.splice(0, 9);
			//console.log(this.data)
		} else {

		}
	}

	reset = () => {
		for (let i = 0;i < 9;i++) {
			this.data[i] = Array(9);
			for (let j = 0;j < 9;j++) {
				this.data[i][j] = new Entry(i, j);
			}
		}
		this.show = false;
		this.counter = 0;
		this.lastSet.splice(0, 3);
	};

	getClass = (i, j) => {
		return (this.lastSet[2] && this.lastSet[2].row == i && this.lastSet[2].column == j) ? 'last3' :
			(this.lastSet[1] && this.lastSet[1].row == i && this.lastSet[1].column == j) ? 'last2' :
				(this.lastSet[0] && this.lastSet[0].row == i && this.lastSet[0].column == j) ? 'last1' :
					(this.data[i][j].value != '') ? 'yellowBg' : '';
	}
}
