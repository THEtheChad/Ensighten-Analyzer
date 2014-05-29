function getData(name, func){
	document.addEventListener('PAGEMESSENGER', function(evt){
		if(evt.detail.id == name) func(evt.detail.data);
	}, false);
}

getData('options', function(data){
	chrome.runtime.sendMessage({type:'page',data:data}, function(response){
	  console.log(response);
	});
});

getData('scripts', function(data){
	chrome.runtime.sendMessage({type:'scripts',data:data}, function(response){
	  console.log(response);
	});
});

var s = document.createElement('script');
s.src = chrome.extension.getURL('pageAnalyzer.js');
s.onload = function() {
	this.parentNode.removeChild(this);
};
document.documentElement.appendChild(s);