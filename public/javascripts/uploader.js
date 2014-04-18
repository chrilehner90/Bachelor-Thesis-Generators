window.onload = function() {

	function handleFileInput(evt) {
		var files = evt.target.files;
	  	var processedFiles = [];

		asyncTaskRunner(files, function*() {
			try {
				for(var i = 0; i < files.length; i++)
					processedFiles.push(yield readFile(files[i]));
				
				console.log(processedFiles);
			}
			catch(e) {
				console.log(e);
			}
		});
	}

	function readFile(file) {
	 	return function(callback) {
	 		var reader = new FileReader();
	 		reader.onloadend = callback;
	 		reader.readAsDataURL(file);
	 	}
	}

	function asyncTaskRunner(files, generatorFunction) {
		var generator = generatorFunction();
		var fileIndex = 0;

		// async loop pattern
		// this function is the callback for FileReader.onloadend
		function nextFile(evt) {
			var result;

			// evt is defined when this function was used as a callback
			// from the FileReader.onloadend function
			if(evt) {
				result = evt.target.result;
				var file = {
					"data": files[fileIndex--],
					"src": result
				};
			}

			// send the file to the generator (first time it's undefined)
			// it returns an object with the returned function of readFile as the value
			var generatorResponse = generator.next(file);
			if(!generatorResponse.done) {
				// execute the value, which is a function and give this function as an argument
				generatorResponse.value(nextFile);
				fileIndex++;
			}
		}
		nextFile(); // start the async loop
	}


	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		document.getElementById('files').addEventListener('change', handleFileInput, false);

		// Click button to see that the site is still responding while it reads the files
		document.getElementById('btn').addEventListener('click', function() {
			console.log("clicked");
		}, false);
	}
	else {
		alert('The File APIs are not fully supported in this browser.');
	}

};