if(window.Bootstrapper){
	function sendData(id, data) {
		var e = new CustomEvent('PAGEMESSENGER', {
			detail: {
				id: id,
				data: data
			}
		});
		document.dispatchEvent(e);
	}

	function sendNexusScripts() {
		var scripts = document.getElementsByTagName('script');

		var nexus = [];
		for (var i = 0, l = scripts.length; i < l; i++) {
			var src = scripts[i].src;

			if (/nexus/.test(src)){
				console.log('ANALYZER: (nexus) ' + src);
				if(/Bootstrap/i.test(src) || /code/i.test(src)){
					console.log('ANALYZER: (pass) ' + src);
					nexus.push(src);
				}
			}
		}

		sendData('scripts', nexus);
	}

	function sendBoostrapperOptions() {
		var options = Bootstrapper.ensightenOptions;

		var data = {
			'published': options.generatedOn,
			'space': options.publishPath,
			'test?': /test/.test(options.nexus) ? 'True' : 'False'
		};

		sendData('options', data);
	}

	sendBoostrapperOptions();
	Bootstrapper.bindPageSpecificCompletion(sendNexusScripts);
}