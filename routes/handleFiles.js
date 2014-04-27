var FS = require("fs"),
	Q = require("q");


exports.receiveUpload = function(req, res){
	var files = req.files.uploads;
	var promisedFiles = [];

	if(files === undefined) {
		res.statusCode = 400;
		res.end();
	}
	
	if(req.files.uploads.length !== undefined) {
		for(var file in files) {
			promisedFiles.push(fileHandler(files[file]));
		}
	}
	else {
		promisedFiles.push(fileHandler(files));
	}

	Q.all(promisedFiles).then(
		function(value) {
			res.send("Files uploaded!");
			res.end();
		}, 
		function(reason) {
			res.send(reason);
			res.end();
		}
	);

};


function fileHandler(file) {
	var deferred = Q.defer();
	FS.readFile(file.path, function (err, data) {

		var imageName = file.name;

		/// If there's an error
		if(!imageName){
			deferred.reject("An error occurred.")
		}
		else {
			var newPath = "public/uploads/" + imageName;

			// write file to uploads folder
			FS.writeFile(newPath, data, function (err) {
				if(err) {
					deferred.reject(err);
				}
				deferred.resolve("done!");

			});
		}
  });
  return deferred.promise;
}