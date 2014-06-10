function HtmlFactory(ele) {
	this._root = ele || document.createElement('div');
	this.reset();
}
HtmlFactory.prototype = {
	setRoot: function(ele){
		ele.innerHTML = this._root.innerHTML;

		if(this.current == this._root){
			this.current = ele;
		}
		this._root = ele;
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
		this.current = this._root;
		this._root.innerHTML = '';
		this.last = {};
	},

	root: function(){
		this.current = this._root;
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

	if(request.type == 'publish'){
		html.reset();
		html.table();

		var deployments = request.data.deployments || [];
		var conditions = request.data.conditions || [];

		console.log(deployments);

		html
			.tr()
				.td('deployments')
				.td();

		deployments.forEach(function(dep){
			html.div(dep.name);
		});

		html
			.tr()
				.td('conditions')
				.td();

	  var btn = document.createElement('BUTTON');
	  btn.innerHTML = 'HTML';
	  btn.addEventListener('click', function(evt){
	  	showHTML(deployments);
	  }, false);

	  html._root.appendChild(btn);

	  var btn = document.createElement('BUTTON');
	  btn.innerHTML = 'CSV';
	  btn.addEventListener('click', function(evt){
	  	showCSV(deployments);
	  }, false);

	  html._root.appendChild(btn);

		conditions.forEach(function(cond){
			html.div(cond.name);
		});
	}

	var props = ['id','name','notes','isDisabled','executionTime','deploymentDependencyIds','spaceName','conditionValues'];
	function showHTML(data){
		var htmlViewer = window.open(null, 'HTML', 'width=600,height=600,location=0,menubar=0,status=1,toolbar=0,resizable=1,scrollbars=1');

		var html = new HtmlFactory();

		html
			.table()
			.tr();

		props.forEach(function(name){
			html.td(name);
		});
		html.tr();

		data.forEach(function(dep){
			html.tr();
			
			props.forEach(function(name){
				html.td(dep[name]);
			});
		});

		setTimeout(function(){
			htmlViewer.document.body.appendChild(html._root);
		}, 100);
	}

	function showCSV(data){
		var str = '';
		var row = [];

		props.forEach(function(name){
			row.push(name);
		});

		str += row.join(',') + '\r\n';

		data.forEach(function(dep){
			var row = [];

			props.forEach(function(name){
				row.push(dep[name]);
			});

			str += row.join(',') + '\r\n';
		});

		str = 'data:text/csv;charset=utf-8,' + encodeURIComponent(str);

		var a = document.createElement('a');
		a.href = str;
		a.target = '_blank';
		a.download = 'deployments.csv';

		document.body.appendChild(a);
		a.click();


		// str = encode_utf8(str);
		// console.log(str);

		// window.open(str, 'CSV', 'width=600,height=600,location=0,menubar=0,status=1,toolbar=0,resizable=1,scrollbars=1');
	}

	function encode_utf8(s) {
	  return unescape(encodeURIComponent(s));
	}

	if (request.type == 'scripts') {
		var scripts = request.data;

		for (var i = 0, l = scripts.length; i < l; i++) {
			getFile(scripts[i], function(contents, url) {
				var match;
				var endpoint;

				if(/Bootstrap/i.test(url)){
					endpoint = 'Bootstrap';
				}
				else{
					var id = /ruleId=(.*)/.exec(url);
					if(!id){
						endpoint = 'Unknown';
					}
					else{
						endpoint = 'Rule: ' + id[1];
					}
				}

				html
					.tr()
						.td('<a href="' + url + '" target="_blank">' + endpoint + '</a>')
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

		var win = window.win = window.open(viewer, 'ANALYZER', 'width=600,height=600,location=0,menubar=0,status=1,toolbar=0,resizable=1,scrollbars=1');

		setTimeout(function(){
			win.document.body.appendChild(html._root);
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