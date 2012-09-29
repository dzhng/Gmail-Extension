
Gmailr.debug = true; // Turn verbose debugging messages on 

// main insertion point
Gmailr.init(function(G) {
    G.insertCss(getData('css_path'));
    G.insertTop($("<div id='tvHeader'><span>Tigervine Status:</span> <span id='status'>Loaded.</span></div>"));

	// we only need to insert the top button once, since it just stays hidden in other states
	var topBtn = G.insertTopButton('Tigervine');

    var status = function(msg) {
        G.$('#tvHeader #status').html(msg);
    };

    G.observe('archive', function(num) {
        status('You just archived ' + num + ' emails.');
    });

    G.observe('delete', function(c) {
        status('You deleted ' + c + ' emails.');
    });

    G.observe('spam', function(c) {
        status('You marked ' + c + ' emails as spam.');
    });

    G.observe('send', function(text) {
        status('You sent an email.');
    });

    G.observe('reply', function(text) {
        status('You replied to an email.');
    });

    G.observe('applyLabel', function(label,emails) {
       status("you applied label " + label + " to " + emails.length + " email(s)");
    });

	G.observe('viewChanged', function(view) {
		status("View changed to " + view);

		// insert additional functions based on view
		var btn = null;
		switch(view) {
		case 'threaded':
			if(!topBtn) {
				// we want to wait a bit before inserting, since DOM needs some time to load
				var i = setInterval(function() {
					if((topBtn = G.insertTopButton('Tigervine')) != null) {
						clearInterval(i);
					}
				}, 100);
			}
			break;
		case 'compose':
			// we want to wait a bit before inserting, since DOM needs some time to load
			var i = setInterval(function() {
				if((btn = G.insertComposeButton('Compose')) != null) {
					clearInterval(i);
				}
			}, 100);
			break;
		case 'reply':
			// we want to wait a bit before inserting, since DOM needs some time to load
			var i = setInterval(function() {
				if((btn = G.insertReplyButton('Reply')) != null) {
					clearInterval(i);

					btn.click(function(e) {
						console.log('reply button clicked');
					});
				}
			}, 100);
			break;
		case 'conversation':
			// we want to wait a bit before inserting, since DOM needs some time to load
			var i = setInterval(function() {
				if((btn = G.insertConversationButton('Conversation')) != null) {
					clearInterval(i);
					btn.click(function(e) {
						console.log('conversation button clicked');
					});
				}
			}, 100);
			break;
		}
	});
});
