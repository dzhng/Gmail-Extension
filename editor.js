// enable strict mode
"use strict";

// editor object
var Editor = function(el, gmailr) 
{
	this.gmailr = gmailr;
	this.canvas = el;		// the entire text area

	this.controller = new EditorController(this);
	this.view = new EditorView(this);

	this.labelEl = null;	// the div that stores the labels
	this.rowEl = null;		// the div that contains the entire injected row
	this.labels = [];		// array of found labels in editor

	this.mode = 'normal';	// current editor mode, can be normal, for normal gmail sending
							// or list, for sending to mailing lists using tags
							
	console.log("editor initialized");
}

Editor.prototype.setLabelElement = function(labelEl, rowEl) {
	this.labelEl = labelEl;
	this.rowEl = rowEl;
	// don't show the label portion on normal mode
	if(this.mode == 'normal') {
		this.rowEl.hide();
	}
}

Editor.prototype.updateListButton = function(btn) {
	switch(this.mode) {
	case 'normal':
		this.mode = 'mail';
		btn.text('Send Mail');
		this.rowEl.show();
		this.gmailr.hideToRow();
		this.gmailr.hideCCLine();
		break;
	case 'mail':
		this.mode = 'normal';
		btn.text('Send to List');
		this.rowEl.hide();
		this.gmailr.showToRow();
		this.gmailr.showCCLine();
		break;
	}
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

