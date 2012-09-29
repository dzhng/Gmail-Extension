/**
 * Gmailr v0.0.1
 * Licensed under The MIT License
 *
 * Copyright 2011, James Yu
 */
"use strict";

// Utility methods

var dbg = function(msg) {
	if(debug)
		console.log(msg);
};

var p = function(els, m) {
	if(!els) {
		dbg(els);
	} else if(els.each) {
		if(els.length == 0) {
			dbg('p: Empty');
		} else {
			els.each(function(i,e) {
				dbg(e);
			});
		}
	} else {
		dbg(els);
	}
};

var pm = function(m, els) {
	dbg(m);
	p(els);
};

var isDescendant = function(el, t) {
	return t.parents().index(el) >= 0;
};

var Gmailr = function() 
{
	var viewState = 'threaded';
	var $body = $('body');

	dbg('Initializing Gmailr API');

	$body.bind("DOMSubtreeModified", function(e) {
		detectDOMEvents(e);
	});

	/*** Inserts the element to the top of the Gmail interface. ***/
	var topButton = null;
	var replyButton = null;
	var composeButton = null;
	var conversationButton = null;

	this.insertTop = function(el) {
		$body.prepend($(el));
	}

	// Inserts the element into the row of buttons in the reply window
	this.insertReplyButton = function(text, callback) {
		// remove all original custom text first
		if(this.replyButton) {
			this.replyButton.remove();
			this.replyButton = null;
		}

		// we want to make a button, and insert the button with the following text
		var el = this.replyButton =
			$('<div class="T-I J-J5-Ji T-I-ax7 Bq" id="tvReplyButton">'+text+'</div>');

		var i = setInterval(function() {
			var p = $('.dW .Cq');
			if(p.length < 1) {
				return null;
			} else {
				console.log('reply btn inserted');
				$(p[0]).append(el);

				// once inserted, clear interval and call the callback
				clearInterval(i);
				if(callback)
					callback(el);
			}
		}, 100);
	}

	// Inserts the element into the row of buttons on top in compose window
	this.insertComposeButton = function(text, callback) {
		// remove all original custom text first
		if(this.composeButton) {
			this.composeButton.remove();
			this.composeButton = null;
		}

		// we want to make a button, and insert the button with the following text
		var el = this.composeButton =
			$('<div class="T-I J-J5-Ji T-I-ax7 Bq" id="tvComposeButton">'+text+'</div>');

		var i = setInterval(function() {
			var p = $('.aeH .eh .dW .Cq');
			if(p.length < 1) {
				return null;
			} else {
				console.log('compose btn inserted');
				p.append(el);

				// once inserted, clear interval and call the callback
				clearInterval(i);
				if(callback)
					callback(el);
			}
		}, 100);
	}

	// insert a button into the top row of buttons in gmail in conversation/compose views
	this.insertConversationButton = function(text, callback) {
		// remove all original custom text first
		if(this.conversationButton) {
			this.conversationButton.remove();
			this.conversationButton = null;
		}

		// we want to make a button, and insert the button with the following text
		var el = this.conversationButton =
			$('<div class="T-I J-J5-Ji T-I-ax7" id="tvConversationButton">'+text+'</div>');

		var i = setInterval(function() {
			var p = $('.iH');
			if(p.length < 1) {
				return null;
			} else {
				console.log('conversation btn inserted');
				p.children().append(el);

				// once inserted, clear interval and call the callback
				clearInterval(i);
				if(callback)
					callback(el);
			}
		}, 100);
	}

	// insert a button into the top row of buttons in gmail in threaded view
	this.insertTopButton = function(text, callback) {
		// remove all original custom text first
		if(this.topButton) {
			this.topButton.remove();
			this.topButton = null;
		}

		// we want to make a button, and insert the button with the following text
		var el = this.topButton =
			$('<div class="T-I J-J5-Ji T-I-ax7" id="tvTopButton">'+text+'</div>');

		var i = setInterval(function() {
			var p = $('.aeH .nH .Cq');
			if(p.length < 1) {
				return null;
			} else {
				console.log('top btn inserted');
				p.children().children().append(el);

				// once inserted, clear interval and call the callback
				clearInterval(i);
				if(callback)
					callback(el);
			} 
		}, 100);
	}

	/* Allows you to apply jQuery selectors in the Gmail DOM, like so:
		G.$('.my_class');
	*/

	this.$ = function(selector) {
		return $body.find(selector);
	}

	/* Inserts a CSS file into the Gmail DOM. */

	this.insertCss = function(cssFile) {
		var css = $('<link rel="stylesheet" type="text/css">');
		css.attr('href', cssFile);
		$('head').first().append(css);
	}

	/**
	 * Subscribe to a specific event in Gmail
	 *   name                arguments passed to callback
	 *   'archive'         - count
	 *   'numUnreadChange' - currentVal, previousVal
	 *   'delete'          - count
	 *   'spam'            - count
	 *   'send'
	 *   'viewChanged'
	 *   'applyLabel'
	 */
	this.observe = function(type, cb) {
		ob_queues[type].push(cb);
	}

	/**
	 * Number of unread messages.
	 */
	this.numUnread = function() {
		// We always look to the inbox link, bc it always displays the number unread
		// no matter where you are in Gmail

		//var title = this.inboxLink[0].title;
		var title = this.inboxLink[0].title;
		var m = /\((\d+)\)/.exec(title);
		return (m && m[1]) ? parseInt(m[1]) : 0;
	}

	/**
	 * Email address of the Gmail account.
	 */
	this.emailAddress = function() {
		// First, try old Gmail header
		var el = $('#guser b');
		if(el.length > 0) return el.first().html();

		// Try the new one
		var el = $('.gbmp1');
		if(el.length > 0) return el.first().html();
	}

	/**
	 * Returns whether the current view is a threaded or conversation view.
	 */
	this.currentView = function() {
		return viewState;
	}

	/*****************************************************************************************
	 * Private Methods
	 */

	var executeObQueues = function(type, arg) {
		if(ob_queues[type])
			for(var i = 0; i < ob_queues[type].length; i++) {
				var args = Array.prototype.slice.call(arguments, 1);
				(ob_queues[type][i]).apply(this, args)
			}
	}

	var ob_queues = {
		reply: [],
		send: [],
		viewChanged: [],
	};

	var detectDOMEvents = function(e) {
		var el = $(e.target);

		var sel = $('.mC .mG');
		if(sel.length > 0) {	// look for the 'reply' button header
			switch($(sel).text()) {
			case 'Reply':
				if(!(viewState == 'reply')) {
					viewState = 'reply';
					executeObQueues('viewChanged', viewState);
				}
				break;
			case 'Forward':
				if(!(viewState == 'forward')) {
					viewState = 'forward';
					executeObQueues('viewChanged', viewState);
				}
				break;
			case 'Reply to all':
				if(!(viewState == 'reply')) {
					viewState = 'reply';
					executeObQueues('viewChanged', viewState);
				}
				break;
			}
		} else if($('.M9').length > 0) {	// look for the edit box
			if(!(viewState == 'compose')) {
				viewState = 'compose';
				executeObQueues('viewChanged', viewState);
			}
		} else if($('.ha').length > 0) {	// look for top conversation header
			if(!(viewState == 'conversation')) {
				viewState = 'conversation';
				executeObQueues('viewChanged', viewState);
			}
		} else {
			if(!(viewState == 'threaded')) {
				viewState = 'threaded';
				executeObQueues('viewChanged', viewState);
			}
		}
	}
};

