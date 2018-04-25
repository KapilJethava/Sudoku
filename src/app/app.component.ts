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

	constructor() {
		for (let i = 0;i < 9;i++) {
			this.data[i] = Array(9);
			for (let j = 0;j < 9;j++) {
				this.data[i][j] = new Entry(i, j);
			}
		}
		this.subject.subscribe(({ row, column, value }) => {
			this.data[row][column].value = this.data[row][column].possibility[0];
			this.resetPossiblity(row, column);
			if (this.counter < 81) {
				setTimeout(() => {
					this.startSolving();
				}, 1000);
			}
		}, (err) => console.log(err));
	}
	startSolving = () => {
		for (let i = 0;i < 9;i++) {
			for (let j = 0;j < 9;j++) {
				if (this.data[i][j].possibility.length === 1) {
					this.subject.next({ row: i, column: j, value: this.data[i][j].possibility[0] });

					// console.log("Run Count => ", this.counter);
					// console.log("Resolved Entry => Row(",i,"), Column(", j,") with value=", this.data[i][j].possibility[0]);
					return;
				}
			}
		}
		alert("Sorry, this sudoku lies under difficult category, will be resolved by next version.")
	}
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
}
