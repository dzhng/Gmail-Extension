// enable strict mode
"use strict";

window.debug = true; // Turn verbose debugging messages on 

// main insertion point
$(function() {

	var G = new Gmailr();
	G.insertCss(getData('css_path'));
	G.insertCss(getData('common_css_path'));

	// we only need to insert the top button once, since it just stays hidden in other states
	var topBtn = G.insertTopButton('Tigervine');
	// editor object, if we're in the corerct state
	var editor = null;

	G.observe('send', (function(text) {
	}).bind(this));

	G.observe('reply', (function(text) {
	}).bind(this));

	G.observe('viewChanged', (function(view) {
		// insert additional functions based on view
		switch(view) 
		{
		case 'threaded':
			if(!topBtn) {
				// we want to wait a bit before inserting, since DOM needs some time to load
				G.insertTopButton('Tigervine', function(el) {
					topBtn = el;
				});
			}
			break;
		case 'compose':
			// we want to wait a bit before inserting, since DOM needs some time to load
			G.insertComposeButton('Send to List', function(el) {
				el.click(function() {
					if(editor) {
						editor.updateListButton(el);
					}
				});
			});
			this.handleEdit();
			break;
		case 'reply':
			// we want to wait a bit before inserting, since DOM needs some time to load
			//G.insertReplyButton('Send to List', function(el) {});
			this.handleEdit();
			break;
		case 'conversation':
			// we want to wait a bit before inserting, since DOM needs some time to load
			//G.insertConversationButton('Conversation', null);
			break;
		}
	}).bind(this));

	// handle when gmail is in editor mode
	this.handleEdit = function() {
		// keep trying until we got the text area
		G.wait('.M9 .editable', function(el) {
			var textarea = el.eq(0).contents().find('body');
			editor = new Editor(textarea, G);
			G.insertEditRow('Labels', function(labelEl, rowEl) {
				// set the label element in editor so it can start creating labels
				editor.setLabelElement(labelEl, rowEl);
				editor.update();	// update once, just in case if theres already some text in there
			});
		});
	}
});
