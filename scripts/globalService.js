(function() {

	var globalService = function($q, $http) {

		var options = {

			// home, work or school (what ip mobile device should be sending logs to)
			'myLocation': 'home',
			'allowSendingLogs': true,
			'blockOrientationChangeEvent': false
		};

		var urls = {
			'api': 'http://www.civilconnectapp.com.au/api',
			'apiProxy': '/api'
		};

		var init = {

			onMobile: undefined,
			apiServerAddress: undefined,

			service: function(windowObject) {

				if (windowObject.cordova) {
					init.onMobile = true;
					init.apiServerAddress = urls.api;

				} else {
					init.onMobile = false;
					init.apiServerAddress = urls.apiProxy;
				}
			}
		};

		var sort = {

			objectsByProp: function(prop, arrayOfObjects) {

				var result = arrayOfObjects.sort(function (objA, objB) {

					if (objA[prop] < objB[prop]) {
						return -1;
					}

					if (objA[prop] > objB[prop]) {
						return 1;
					}

					return 0;
				});

				return result;
			}
		};

		var filter = {

			byOnMobileFlag: function(whenTrueMethod, whenFalseMethod, args) {

				switch (init.onMobile) {
					case true: if (whenTrueMethod) { whenTrueMethod(args); } break;
					case false: if (whenFalseMethod) { whenFalseMethod(args); } break;
				}
			},
			objectsByPropsValues: function(expectedPropsValuesObj, arrayOfObjects) {

				var i, j;
				var result = [];

				// For every array object
				for (i = 0; i < arrayOfObjects.length; ++i) {

					var accepted = true;
					var keys = Object.keys(expectedPropsValuesObj);

					// For every prop in expectedPropsValuesObj
					for (j = 0; j < keys.length; ++j) {

						// Comparing values
						if (arrayOfObjects[i][keys[j]] !== undefined && arrayOfObjects[i][keys[j]] !== expectedPropsValuesObj[keys[j]]) {
							accepted = false;
							break;
						}
					}

					if (accepted) {
						result.push(arrayOfObjects[i]);
					}
				}

				return result;
			}
		};

		return {

			'options': options,
			'urls': urls,
			'init': init,
			'sort': sort,
			'filter': filter
		};
	};



	globalService.$inject = ['$q', '$http'];
	angular.module('appModule').service('globalService', globalService);
})();