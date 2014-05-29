function HtmlFactory(ele) {
	this.root = ele || document.createElement('div');
	this.reset();
}
HtmlFactory.prototype = {
	setRoot: function(ele){
		ele.innerHTML = this.root.innerHTML;

		if(this.current == this.root){
			this.current = ele;
		}
		this.root = ele;
	},

	create: function(type, html){
		if(type == 'TD'){
			this.current = this.last.TR;
		}
		else
		if(type == 'TR'){
			this.current = this.last.TABLE;
		}

		var ele = document.createElement(type);
		if(html) ele.innerHTML = html;

		this.current.appendChild(ele);
		this.current = ele;
		this.last[type] = ele;
		return this;
	},

	reset: function(){
		this.current = this.root;
		this.root.innerHTML = '';
		this.last = {};
	},

	root: function(){
		this.current = this.root;
		return this;
	},

	table: function(html){
		return this.create('TABLE', html);
	},

	tr: function(html) {
		return this.create('TR', html);
	},

	td: function(html) {
		return this.create('TD', html);
	},

	div: function(html) {
		return this.create('DIV', html);
	},

	append: function(html){
		this.current.innerHTML = this.current.innerHTML + html;
	}
};

var win, html = new HtmlFactory();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	console.log(request);

	if (request.type == 'page') {
		html.reset();
		html.table();

		var opts = request.data;

		for (key in opts) {
			html
				.tr()
					.td(key)
					.td(opts[key]);
		}
	}

	if (request.type == 'scripts') {
		var scripts = request.data;

		for (var i = 0, l = scripts.length; i < l; i++) {
			getFile(scripts[i], function(contents, url) {
				var match;

				html
					.tr()
					.td('<a href="' + url + '" target="_blank">DIDs</a>')
					.td();

				var regEx = /,\s*-?\d+?\s*,\s*(-?\d+?)\s*\)|,\s*-?\d+?\s*,\s*\[.+?\]\s*,\s*(-?\d+?)\s*,\s*\[.+?\]\s*\)/g;

				while (match = regEx.exec(contents)) {
					html.div(match[1] || match[2]);
				}
			});
		}
	}

	if (request.type == 'popup') {
		var viewer = chrome.extension.getURL('viewer.html');

		win = window.open(viewer, 'ANALYZER', 'width=600,height=600,location=0,menubar=0,status=1,toolbar=0,resizable=1,scrollbars=1');

		console.log(window.meep = win);
		setTimeout(function(){
			win.document.body.appendChild(html.root);
		}, 100);
		// var popup = chrome.extension.getViews({
		// 	type: 'popup'
		// })[0];

		// var div = document.createElement('div');
		// div.innerHTML = 'MASTER';

		// popup.document.body.appendChild(div);
	}
});

function getFile(url, func) {
	var req = new XMLHttpRequest();
	req.open('GET', url, true);
	req.onreadystatechange = statusListener;
	req.send(null);

	function statusListener() {
		if (req.readyState == 4) {
			func(req.responseText, url);
		}
	}
}