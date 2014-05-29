document.getElementById('analyzer').addEventListener('click', function(evt){
	chrome.runtime.sendMessage({type:'popup'}, function(response){
	  console.log(response);
	});
}, false);