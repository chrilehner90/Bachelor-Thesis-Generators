window.onload = function() {
	'use strict';
	function handleFileInput(evt) {
		var files = evt.target.files;
		var processedFiles = [];

		asyncTaskRunner(files, function*() {
			try {
				for(var i = 0; i < files.length; i++) {
					// yields this object: {value: function, done: true || false}
					processedFiles.push(yield readFile(files[i]));
				}
				yield uploadFiles(processedFiles);
				console.log('finished...');
			}
			catch(err) {
				console.error(err);
			}
		});
	}

	function readFile(file) {
	 	return function(callback) {
	 		var reader = new FileReader();
	 		reader.onload = callback;
	 		reader.onerror = callback;
	 		console.log('reading...');
	 		reader.readAsDataURL(file);
	 	};
	}

	function uploadFiles(files) {
		return function(callback) {
			var formData = new FormData();
			var xhr = new XMLHttpRequest();
			xhr.open('POST', 'http://localhost:3000/upload', true);
			xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
			xhr.onload = callback;
			xhr.onerror = callback;
			for(var file in files) {
				formData.append('uploads', files[file].data);
			}
			console.log('uploading...');
			xhr.send(formData);
		};
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


			var processedFile;
			var generatorResponse;
			if(evt) {
				if(evt.target.error) {
					generator.throw(evt.target.error.message);	
				}
				else if (evt.target.status && evt.target.status !== 200) {
					console.log(evt);
					generator.throw(evt.target.statusText);
				}
				processedFile = {
					'data': files[fileIndex - 1],
					'src': result
				};
			}

			// send the file to the generator (first time it's undefined)
			// it returns an object with the returned function of readFile as the value
			generatorResponse = generator.next(processedFile);
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
			console.log('clicked');
		}, false);
	}
	else {
		alert('The File APIs are not fully supported in this browser.');
	}

};