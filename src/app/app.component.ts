import { Component } from '@angular/core';
import * as _ from 'lodash';
import { Entry } from './Entry';
import { SquareMatrix } from './SquareMatrix';
import { Subject } from 'rxjs/Subject';

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
	show = false;
	lastSet = [];
	debug = false;

	constructor() {
		this.reset();
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
		for (let value = 1;value < 10;value++) {
			for (let i = 0;i < 9;i++) {
				// For Row
				arr = _.filter(this.data[i], (cell) => cell.possibility.includes(value));
				if (arr.length == 1) {
					this.subject.next({ row: arr[0].row, column: arr[0].column, value: value });
					// console.log("Row Resolved=>", arr, value);
					return;
				} else {
					
				}
			}

			for (let i = 0;i < 9;i++) {
				// For column
				arr = _.filter(data, (cell) => cell.column == i && cell.possibility.includes(value));
				if (arr.length == 1) {
					this.subject.next({ row: arr[0].row, column: arr[0].column, value: value });
					// console.log("Column Resolved=>", arr, value);
					return;
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
		this.debug = true;
		alert("Its seems like you have entered very less entries to resolve, please reset and provide more entries to resolve this sudoku.");
	};

	level3Solving = () => {
		var data = _.flatMap(this.data, (row) => row);
		var arr = [];


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
			alert('Same row already has an entry of '+ value + '.');
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
