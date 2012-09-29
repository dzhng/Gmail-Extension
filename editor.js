// enable strict mode
"use strict";

// editor object
var Editor = function(el) 
{
	var canvas = el;

	this.controller = new this._controller(canvas);
	this.model = new this._model();
	this.view = new this._view();

	console.log("editor initialized");
}

Editor.prototype._model = function() {
}

Editor.prototype._controller = function(canvas) {
	canvas.on({
		keydown: function(e) {
			console.log('keydown');
		},
		keyup: function(e) {
		},
		mouseup: function(e) {
		}
	});
}

Editor.prototype._view = function() {
}

