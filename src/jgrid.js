/*
 *  Copyright (C) 2014 Jared Chua
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *	You should have received a copy of the GNU General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.	
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */	

(function() {
	var autoHandler,
		$grid = $('#grid'),
		$gridElements = $([]);
		
	var grid = {
		maxDimensions: 20,
		height: 9,
		width: 9,
		speed: 150,
		pattern: 'Box',
		autoClick: 'off'
	};

	var JGrid = {
		Patterns: {
			Box: {
				list:	[
					[7,0,1],
					[1],
					[1,2,3],
					[3],
					[3,4,5],
					[5],
					[5,6,7],
					[7],
					[0,1,2,3,4,5,6,7]
				]
			},

			Star: {
				list:	[
					[0],
					[1],
					[2],
					[3],
					[4],
					[5],
					[6],
					[7],
					[0,1,2,3,4,5,6,7]
				]
			},

			Plus: {
				list: 	[
					[null],
					[1],
					[null],
					[3],
					[null],
					[5],
					[null],
					[7],
					[1,3,5,7]
				]
			},

			X: {
				list:	[
					[0],
					[null],
					[2],
					[null],
					[4],
					[null],
					[6],
					[null],
					[0,2,4,6]
				]
			},

			Flower: {
				list:	[
					[1],
					[2],
					[3],
					[4],
					[5],
					[6],
					[7],
					[0],
					[0,1,2,3,4,5,6,7,8]
				],

				lives: 9
			}			
		},

		isDefined: function(x, y) {
			return ($gridElements[x] === undefined || 
					$gridElements[x][y] === undefined)
				? false : true;
		},

		getNeighbors: function(pattern, direction) {
			return JGrid.Patterns[pattern].list[direction];
		},

		activate: function($box, direction, life) {
			
			if($box.css('display') === 'none' || life === 0) { return; }

			// I didn't want to use IDs for the boxes.
			// Therefore, I had to find their index by
			// traversing the DOM.
			var $parent = $box.parent(),
				x = $parent.parent().children().index($parent),
				y = $parent.children().index($box);
			
			var thisBox = $box;
				thisBox.addClass('activated');

			setTimeout(function() {
				thisBox.removeClass('activated');

				var neighbors = JGrid.getNeighbors(grid.pattern, direction);
				
				for(var index = 0; index < neighbors.length; index++) {
					
					var newDirection = neighbors[index],
						updatedLife = (life === undefined) ? life : life - 1;

					switch (newDirection) {
						case 0:
							if(JGrid.isDefined(x - 1, y - 1))
								JGrid.activate($gridElements[x - 1][y - 1], newDirection, updatedLife);
							break;
						case 1:
							if(JGrid.isDefined(x - 1, y))
								JGrid.activate($gridElements[x - 1][y], newDirection, updatedLife);
							break;
						case 2:
							if(JGrid.isDefined(x - 1, y + 1))
								JGrid.activate($gridElements[x - 1][y + 1], newDirection, updatedLife);
							break;
						case 3:
							if(JGrid.isDefined(x, y + 1))
								JGrid.activate($gridElements[x][y + 1], newDirection, updatedLife);
							break;
						case 4:
							if(JGrid.isDefined(x + 1, y + 1))
								JGrid.activate($gridElements[x + 1][y + 1], newDirection, updatedLife);
							break;
						case 5:
							if(JGrid.isDefined(x + 1, y))
								JGrid.activate($gridElements[x + 1][y], newDirection, updatedLife);
							break;
						case 6:
							if(JGrid.isDefined(x + 1, y - 1))
								JGrid.activate($gridElements[x + 1][y - 1], newDirection, updatedLife);
							break;
						case 7:
							if(JGrid.isDefined(x, y - 1))
								JGrid.activate($gridElements[x][y - 1],
									newDirection, updatedLife);
							break;
					}
				}
			}, grid.speed); // End setTimeout.
		},

		adjustBoxSize: function() {
			var divWidth = $('div#grid').width(),
				numberOfBoxes = (grid.width >= grid.height) ?
					grid.width : grid.height,
				newWidth = 0.9 / numberOfBoxes,
				newHeight = divWidth * newWidth,
				newMargin = (divWidth * 0.1) / (numberOfBoxes * 2);

			$('div.box').css({
				'width':(newWidth * 100) + '%',
				'height':newHeight + 'px',
				'margin':newMargin + 'px'
			});
		},

		modifyGrid: function(newValue, axis) {
			// Change in grid height.
			if(axis === 'gridHeight') {
				// Case A: current height > new height.
				if(grid.height > newValue) {
					for(var row = newValue; row < grid.height; row++) {
						for(var col = 0; col < grid.width; col++) {
							$gridElements[row][col].hide();
						}
					}
				}

				// Case B: current height < new height.
				else {
					if(newValue > grid.maxHeight) {
						// Create missing rows.
						for(var row = grid.maxHeight; row < newValue; row++) {
							// Create the new row.
							var $newRow = $('<div>').addClass('row clearfix');
							$gridElements.push([]);
							$grid.append($newRow);

							// Populate the new row with new boxes.
							for(var col = 0; col < grid.maxWidth; col++) {
								$newBox = $('<div>').addClass('box');
								if(col >= grid.width) { $newBox.hide(); }
								$gridElements[row].push($newBox);
								$newRow.append($newBox);
							}
						}
						grid.maxHeight = newValue;
					}

					// Show the hidden rows.
					for(var row = grid.height; row < newValue; row++) {
						for(var col = 0; col < grid.width; col++) {
							$gridElements[row][col].show();
						}
					}
				} // End case B.

				grid.height = newValue;
				JGrid.adjustBoxSize();
			} // End change in grid height.

			// Change in grid width.
			else {
				// Case A: current width > new width.
				if(grid.width > newValue) {
					// Hide the extra columns.
					for(var col = newValue; col < grid.width; col++) {
						for(var row = 0; row < grid.height; row++) {
							$gridElements[row][col].hide();
						}
					}
				}
				// End case A

				// Case B: current width < new width.
				else {
					if(newValue > grid.maxWidth) {
						// Create the missing columns.
						for(var col = grid.maxWidth; col < newValue; col++) {

							// Populate the new columns with boxes.
							for(var row = 0; row < grid.maxHeight; row++) {
								$newBox = $('<div>').addClass('box');
								if(row >= grid.height) { $newBox.hide(); }
								$gridElements[row].push($newBox);
								$('div.row:nth-child(' + (row + 1) + ')').append($newBox);
							}
						}
						grid.maxWidth = newValue;
					}

					// Show hidden columns that have already been created.
					for(var col = grid.width; col < newValue; col++) {
						for(var row = 0; row < grid.height; row++) {
							$gridElements[row][col].show();
						}
					}
				} // End case b.

				grid.width = newValue;
				JGrid.adjustBoxSize();
			} // End change in grid width.

			JGrid.adjustBoxSize();
		},

		initGrid: function() {
			JGrid.updateDivTransitionSpeed();

			for(var row = 0; row < grid.height; row++) {
				$gridElements.push([]);
				$newRow = $('<div>').addClass('row clearfix');
				$grid.append($newRow);
				
				for(var col = 0; col < grid.width; col++) {
					$newDiv = $('<div>').addClass('box');
					$gridElements[row].push($newDiv);
					$newRow.append($newDiv);
				}
			}

			JGrid.adjustBoxSize();

			$grid.on('click', function(e) {
				if ($(e.target).hasClass('box')) {
					JGrid.activate($(e.target), 8, grid.lives);
				}
			});
			
			$(window).on('resize', function() {
				JGrid.adjustBoxSize();
			})
			//
			console.log($gridElements[2][0]);
		},

		initGUI: function() {
			var $selects_heightAndWidth = $('select[name^="grid"]'),
				$select_pattern = $('select[name="pattern"]'),
				$select_speed = $('select[name="speed"]');

			/* Height and Width <select>s */
			for(var index = 1; index <= grid.maxDimensions; index++) {
				var $newOption = $('<option>').text(index);

				if(index === grid.height) {
					$newOption.attr('selected','');
				}
				$selects_heightAndWidth.append($newOption);
			}

			$selects_heightAndWidth.on('change', function(e) {
				JGrid.modifyGrid(parseInt(e.target.value), this.name);
				JGrid.disableAutoClick();
			});

			/* Pattern <select> */
			for(var obj in JGrid.Patterns) { 
					var $newOption = $('<option>').text(obj);

					if(obj === grid.pattern) {
						$newOption.attr('selected','');
					}
					$select_pattern.append($newOption);
			}

			$select_pattern.on('change', function(e) {
				var value = e.target.value;

				grid.pattern = value;
				grid.lives = JGrid.Patterns[value].lives;

				JGrid.disableAutoClick();				
			});

			/* Speed <select> */
			for(var x = 50; x <= 1000; x += 50) { 
					var $newOption = $('<option>').text(x);
					if(x === grid.speed) {
						$newOption.attr('selected','');
					}
					$select_speed.append($newOption);
			}

			$select_speed.on('change', function(e) {
				var newSpeed = e.target.value;
				grid.speed = newSpeed;
				JGrid.updateDivTransitionSpeed();
				JGrid.disableAutoClick();
			});			

			/* AutoClick <select> */
			$('select[name=autoClick]').on('change', function(e) {
					newAutoClickSetting = e.target.value;
					grid.autoClick = newAutoClickSetting;
					if(newAutoClickSetting === 'on') {
						JGrid.enableAutoClick();
					} else {
						JGrid.disableAutoClick();
					}

			});
		},

		updateDivTransitionSpeed: function() {
			if($('style').length === 0) {
				$('head').append($('<style type="text/css">'));
			}

			var $styleHandler = $('style'),
				speed = grid.speed / 1000,
				transitionString = 
					'div.box {' +
						'-webkit-transition:all ' + speed + 's;' +
						'-moz-transition:all ' + speed + 's;' +
						'-o-transition:all ' + speed + 's;' +
						'transition:all ' + speed + 's;' +
					'}';

			$styleHandler
				.empty()
				.html(transitionString);
		},

		enableAutoClick: function() {
			var newInterval = (grid.height >= grid.width) ?
				grid.height + 2 : grid.width + 2;

			autoHandler = setInterval(function() {
				if(grid.autoClick === 'off')
					return;

				var randX = Math.floor(Math.random() * grid.height),
					randY = Math.floor(Math.random() * grid.width);

				JGrid.activate($gridElements[randX][randY], 8, grid.lives);
			},(newInterval * grid.speed));
		},

		disableAutoClick: function() {
			if(typeof autoHandler === 'undefined') { return; }

			$('select[name="autoClick"]')
				.children()
				.eq(1)
				.attr('selected','');

			window.clearInterval(autoHandler);
		},

		extendSettings: function(config) {
			$.extend(grid, config);
			grid.maxHeight = grid.height;
			grid.maxWidth = grid.width;
		},

		init: function(config) {
			JGrid.extendSettings(config);
			JGrid.initGUI();	
			JGrid.initGrid();
		}

	}; // end JGrid.
	
	JGrid.init({
		// Override grid settings here.
	});

})();