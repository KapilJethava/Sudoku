import { Component } from '@angular/core';
import * as _ from 'lodash';
import { Entry } from './Entry';
import { SquareMatrix } from './SquareMatrix';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'app';
	data = [];
	counter = 0;
	constructor() {
		for (let i = 0;i < 9;i++) {
			this.data[i] = Array(9);
			for (let j = 0;j < 9;j++) {
				this.data[i][j] = new Entry(i, j);
			}
		}
	}
	startSolving = () => {
		this.counter++;
		for (let i = 0;i < 9;i++) {
			for (let j = 0;j < 9;j++) {
				if(this.data[i][j].possibility.length === 1) {
					this.data[i][j].value = this.data[i][j].possibility[0];
					this.resetPossiblity(i, j, this.data[i][j].squareNo, this.data[i][j].value);
					// console.log("Run Count => ", this.counter);
					// console.log("Resolved Entry => Row(",i,"), Column(", j,") with value=", this.data[i][j].possibility[0]);
					return;
				}
			}
		}
	}
	resetPossiblity = (row, column, squareNum, value) => {
		var possibility = [], index = -1;
		if(value != "") {
			value = +value;
			_.forEach(this.data[row], (entry) => {
				index = entry.possibility.indexOf(value);
				if(index > -1) {
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
		}
		
	}
}
