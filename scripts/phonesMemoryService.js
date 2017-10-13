(function() {

	var phonesMemoryService = function($rootScope, $cordovaFile, globalService, log) {

		var init = {

			dataStorageDir: undefined,

			service: function(cordovaObject) {

				globalService.filter.byOnMobileFlag(function() {
					init.dataStorageDir = cordova.file.dataDirectory;
					log.post('memory', { 'sender': 'init.service', 'init.dataStorageDir': init.dataStorageDir });
				});
			}
		};

		var file = {

			read: function(folder, file, successCallBack, errorCallBack) {

				globalService.filter.byOnMobileFlag(function() {
					
					// On mobile
					$cordovaFile.readAsText(folder, file).then(function(fileData) {

						// Success
						if (successCallBack) { successCallBack(fileData); }
						log.post('memory', { 'sender': 'file.read', 'folder': folder, 'file': file, 'fileData': { 'type': jQuery.type(fileData), 'length': fileData.length }, 'status': 'success' });
					},
					function(fileData) {

						// Error
						if (errorCallBack) { errorCallBack(fileData); }
						log.post('memory', { 'sender': 'file.read', 'folder': folder, 'file': file, 'fileData': { 'type': jQuery.type(fileData), 'length': fileData.length }, 'status': 'error' });
					});

				// On Pc
				}, function() {

					if (errorCallBack) { errorCallBack({ code: 1 }); }
					log.post('memory', { 'sender': 'file.read', 'folder': folder, 'file': file, 'status': 'error', 'info': 'not on mobile' });
				});	
			},
			save: function(folder, file, fileData, successCallBack, errorCallBack) {

				globalService.filter.byOnMobileFlag(function() {
					
					// On mobile
					$cordovaFile.writeFile(folder, file, fileData, true).then(function(success) {

						// Success
						if (successCallBack) { successCallBack(); }
						log.post('memory', { 'sender': 'file.save', 'folder': folder, 'file': file, 'fileData': { 'type': jQuery.type(fileData), 'length': fileData.length }, 'status': 'success' });
					},
					function(error) {

						// Error
						if (errorCallBack) { errorCallBack(); }
						log.post('memory', { 'sender': 'file.save', 'folder': folder, 'file': file, 'fileData': { 'type': jQuery.type(fileData), 'length': fileData.length }, 'status': 'error' });
					});

				// On Pc
				}, function() {

					if (errorCallBack) { errorCallBack(); }
					log.post('memory', { 'sender': 'file.save', 'folder': folder, 'file': file, 'fileData': { 'type': jQuery.type(fileData), 'length': fileData.length }, 'status': 'error', 'info': 'not on mobile' });
				});
			}
		};

		var mapStates = {

			fileName: 'mapStates.json',

			read: function(args, successCallBack, errorCallBack) {

				file.read(init.dataStorageDir, mapStates.fileName, successCallBack, errorCallBack);
			},
			save: function(args, successCallBack, errorCallBack) {

				file.save(init.dataStorageDir, mapStates.fileName, args.fileData, successCallBack, errorCallBack);
			},
			createDirs: function(args, successCallBack, errorCallBack) {

				globalService.filter.byOnMobileFlag(function() {

					// On mobile

					for (var i = 0; i < args.mapStates.length; ++i) {

						var result = $cordovaFile.createDir(init.dataStorageDir, args.mapStates[i].name, false);

						// Ok
						if (result.$$state.status === 0) {

							if (i + 1 == args.mapStates.length) {

								log.post('memory', { 'sender': 'mapStates.createDirs', 'status': 'success' });
								if (successCallBack) { successCallBack(); }
							}
													
						// Error
						} else {
							
							log.post('memory', { 'sender': 'mapStates.createDirs', 'status': 'error' });
							if (errorCallBack) { errorCallBack(); }
							
							break;
						}
					}

				}, function() {

					// On Pc
					log.post('memory', { 'sender': 'mapStates.createDirs', 'status': 'error', 'info': 'not on mobile' });
					if (errorCallBack) { errorCallBack(); }
				});
			}	
		};

		var categories = {

			fileName: 'categories.json',

			read: function(args, successCallBack, errorCallBack) {

				file.read(init.dataStorageDir, categories.fileName, successCallBack, errorCallBack);
			},
			save: function(args, successCallBack, errorCallBack) {

				file.save(init.dataStorageDir, categories.fileName, args.fileData, successCallBack, errorCallBack);
			}
		};

		var companies = {

			read: function(args, successCallBack, errorCallBack) {

				file.read(init.dataStorageDir + args.mapStateName, args.fileName + '.json', successCallBack, errorCallBack);
			},
			save: function(args, successCallBack, errorCallBack) {

				file.save(init.dataStorageDir + args.mapStateName, args.fileName + '.json', args.fileData, successCallBack, errorCallBack);
			}
		};

		return {

			'init': init,
			'file': file,
			'mapStates': mapStates,
			'categories': categories,
			'companies': companies
		};
	};



	phonesMemoryService.$inject = ['$rootScope', '$cordovaFile', 'globalService', 'log'];
	angular.module('appModule').service('phonesMemoryService', phonesMemoryService);

})();