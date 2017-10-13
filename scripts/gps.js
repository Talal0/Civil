(function() {

	var gps = function($rootScope, $cordovaGeolocation, globalService, log) {

		var opt = {

			reverseGeoCoding: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=',
			expectedCountry: 'Australia',
			usersLocation: undefined,
			reverseGeoCodingObject: undefined,
			geoCheckDone: false
		};

		var inspect = {

			locationServices: function(currentOs) {

				var options = {};

				switch (currentOs) {
					case 'Android': options = { 'enableHighAccuracy': true, 'timeout': 10000 }; break;
					case 'iOS': options = { 'enableHighAccuracy': true }; break;
				}

				opt.geoCheckDone = false;

				$cordovaGeolocation.getCurrentPosition(options).then(function(success) {

					// Success

					opt.geoCheckDone = true;
					opt.usersLocation = { lat: success.coords.latitude, lng: success.coords.longitude };

					// Mocking Victoria state
					// opt.usersLocation = { lat: -37.890305, lng: 145.248389 };

					log.post('gps', { 'usersLocation': opt.usersLocation });

				}, function(error) {

					// Error

					opt.geoCheckDone = true;
					opt.usersLocation = undefined;
					log.post('gps', { 'usersLocation': 'could not determine' });
				});
			},
			reverseGeoCodingObject: function(rgcObj, statesNamesArray) {

				if (rgcObj.status == 'OK') {

					opt.reverseGeoCodingObject = rgcObj;
					var country = inspect.reverseGeoCodingValue(rgcObj, 'country', 'long_name');

					log.post('gps', { 'country expected': opt.expectedCountry, 'country determined': country });

					if (country === opt.expectedCountry) {

						var state = inspect.reverseGeoCodingValue(rgcObj, 'administrative_area_level_1', 'short_name');
						var index = statesNamesArray.indexOf(state);
						var postCode = inspect.reverseGeoCodingValue(rgcObj, 'postal_code', 'long_name');

						$rootScope.$broadcast('$update', { 'filterWindow': { 'gpsPostCode': postCode } });

						log.post('gps', { 'state determined': state, 'gps postcode determined': postCode });
						return index;

					} else { return -1; }

				} else {

					opt.reverseGeoCodingObject = undefined;
					return -1;
				}
			},
			reverseGeoCodingValue: function(rgcObj, typeOfValue, valueLengthType) {

				for (var i = 0; i < rgcObj.results.length; ++i) {

					if (angular.isDefined(rgcObj.results[i].address_components)) {

						for (var j = 0; j < rgcObj.results[i].address_components.length; ++j) {

							if (angular.isDefined(rgcObj.results[i].address_components[j].types)) {

								if (angular.isDefined(rgcObj.results[i].address_components[j].types)) {
									if (rgcObj.results[i].address_components[j].types.indexOf(typeOfValue) > -1) {
										return rgcObj.results[i].address_components[j][valueLengthType];
									}
								}
							}
						}
					}
				}

				return undefined;
			}
		};

		var is = {

			'geoCheckDone': function() {

				if (opt.geoCheckDone) { return true; } else { return false; }
			}
		};

		return { 'opt': opt, 'inspect': inspect, 'is': is };
	};

	gps.$inject = ['$rootScope', '$cordovaGeolocation', 'globalService', 'log'];
	angular.module('appModule').service('gps', gps);
})();