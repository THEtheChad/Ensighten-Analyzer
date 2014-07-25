function sendData(id, data) {
	var e = new CustomEvent('PAGEMESSENGER', {
		detail: {
			id: id,
			data: data
		}
	});
	document.dispatchEvent(e);
}

if(/manage\.ensighten\.com/i.test(window.location.host)){
	Sauron.on().controller('deploy/publish/confirm').start(function($modal, data, cb){
    _.parallel([
      function(cb){
        Sauron.voice('deploy/getCommitted', {'spaceId': data.spaceId}, cb);
      },
      function(cb){
        Sauron.voice('condition/getUpdatedConditionsSinceLastPublish', {'spaceId': data.spaceId}, cb);
      }
    ], function(err, output){
    	if(err) return;

    	var deps = output[0];
    	var cond = output[1];

    	console.log('publish', window.meep = output);

    	sendData('publish', {
    		deployments: deps || [],
    		conditions: cond || []
    	});
    });
  });
}

if(window.Bootstrapper){

	function sendNexusScripts() {
		var scripts = document.getElementsByTagName('script');

		var nexus = [];
		for (var i = 0, l = scripts.length; i < l; i++) {
			var src = scripts[i].src;

			if (/nexus/.test(src)){
				if(/Bootstrap/i.test(src) || /code/i.test(src)){
					nexus.push(src);
				}
			}
		}

		sendData('scripts', nexus);
	}

	function sendBoostrapperOptions() {
		var options = Bootstrapper.ensightenOptions;

		var data = {
			'published': (new Date(options.generatedOn)).toString(),
			'space': options.publishPath,
			'test?': /test/.test(options.nexus) ? 'True' : 'False'
		};

		sendData('options', data);
	}

	sendBoostrapperOptions();
	Bootstrapper.bindPageSpecificCompletion(sendNexusScripts);
}