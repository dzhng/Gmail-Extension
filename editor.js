// enable strict mode
"use strict";

// editor object
var Editor = function(el) 
{
	this.canvas = el;		// the entire text area

	this.controller = new EditorController(this);
	this.view = new EditorView(this);

	this.labelEl = null;	// the div that stores the labels
	this.labels = [];		// array of found labels in editor

	console.log("editor initialized");
}

Editor.prototype.update = function() {
	var html = this.canvas.html();
	var matches = html.match(/@[a-zA-Z0-9]+/g);
	//var matches = html.match(/@[^ <]+/g);
	//console.log(matches);
	if(matches) {
		for (var i = 0; i < matches.length; i++) {
			matches[i] = matches[i].trim().split("&nbsp;")[0].split("@")[1];  //hack :(
		}

		// remove duplicate tags
		this.labels = $.unique(matches);
	} else {
		this.labels = [];
	}

	// update the view with the matches
	this.view.displayTags([], [], this.labels);
}

var EditorController = function(model) 
{
	var model = model;

	model.canvas.on({
		keydown: function(e) {
			model.update();
		},
		keyup: function(e) {
		},
		mouseup: function(e) {
		}
	});
}

var EditorView = function(model) 
{
	this.model = model;
}

// display the given tags in the area under the editor
EditorView.prototype.displayTags = function(tags, nulledTags, presentTags) {
	// combine the tags together
	var combined = $.unique(tags.concat(nulledTags, presentTags).sort());

	// tags will be displayed as a bunch of bootstrap tags
	var html = '';
	for(var i = 0; i < combined.length; i++) {
		html += '<span class="label ' + 
			((presentTags && (presentTags.indexOf(combined[i]) != -1)) ?	// this is in present tags
				 (((tags.indexOf(combined[i]) != -1)) ? 'label-success' : 'label-important') :
				 (tags.indexOf(combined[i]) != -1 ? '' : 'label-dim')) +
			'">' + combined[i] + '</span>';
	}
	this.model.labelEl.html(html);
}

