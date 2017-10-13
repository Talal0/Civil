(function() {

	var mapService = function($rootScope, $compile, $parse, $timeout, $interval, $window, $ionicHistory, httpService, activeIdService, globalService, log, scripts) {

		var map = {

			readyIntervalTime: 1000,
			defaultMapCenter: { lat: 0, lng: 0 },
			defaultMapZoom: 5,
			markerIconUrl: 'img/marker2.png',

			isReadyToSetup: function(args, successCallback, failCallback) {

				// Map not initialized
				if (!args.mapServiceObject.isInitialized()) {

					// Google api or info box lib not loaded
					if (!window.google || !window.InfoBox) {

						window.google = undefined;
						window.InfoBox = undefined;

						scripts.load.mapScripts(function() {

							// Managed to load google api and info box lib
							if (window.google && window.InfoBox) {

								log.post('map', { 'sender': args.mapServiceObject.name + '.isReadyToSetup', 'info': 'managed to load all necessary libs' });
								args.mapServiceObject.init(args, successCallback);

							} else {

								log.post('map', { 'sender': args.mapServiceObject.name + '.isReadyToSetup', 'info': 'could not load all necessary libs' });
								failCallback();
							}
						});

					// Google api loaded
					} else {

						log.post('map', { 'sender': args.mapServiceObject.name + '.isReadyToSetup', 'info': 'all necessary libs loaded, can initialize' });
						args.mapServiceObject.init(args, successCallback);
					}

				// Map initialized
				} else {

					log.post('map', { 'sender': args.mapServiceObject.name + '.isReadyToSetup', 'info': 'map already initialized' });
					successCallback();
				}
			}
		};

		var marker = {

			isWithinMapBounds: function(mapBounds, marker) {

				if (mapBounds.contains(new google.maps.LatLng(marker.latitude, marker.longitude))) { return true; } else { return false; }
			}
		};

		var mainGoogleMap = {

			name: 'mainGoogleMap',
			defaultMapZoom: 5,
			instance: undefined,
			markersObjects: [],
			activeMarker: undefined,
			tilesLoaded: false,
			bounds: undefined,

			init: function(args, callback) {

				mainGoogleMap.instance = new google.maps.Map(document.getElementById('mainGoogleMap'), { center: map.defaultMapCenter, zoom: mainGoogleMap.defaultMapZoom });
				$rootScope.$broadcast('$update', { 'content2': { 'mainMapInstance': mainGoogleMap.instance } });


				// Event listeners

				mainGoogleMap.instance.addListener('click', function() {
					infoWindow.close();
					mainGoogleMap.activeMarker = undefined;
					$rootScope.$broadcast('$update', { 'content2': { 'activeMarker': undefined } });
				});

				mainGoogleMap.instance.addListener('tilesloaded', function() {
					log.post('map', { 'sender': 'mainGoogleMap.$tilesloaded', 'status': 'invoked' });
					mainGoogleMap.tilesLoaded = true;
				});

				mainGoogleMap.instance.addListener('bounds_changed', function() {

					if (!globalService.options.blockOrientationChangeEvent) {

						if (mainGoogleMap.isReadyToShow() && mainGoogleMap.isInitialized() && $ionicHistory.currentView().stateName == 'content2') {

							log.post('map', { 'sender': 'mainGoogleMap.$bounds_changed', 'status': 'invoked' });

							$rootScope.$broadcast('$doCollectionMapBoundsCheck', {
								'callback': function(content2Settings) {
									activeIdService.company.setId(content2Settings.companyId);
									$rootScope.$broadcast('$update', {
										'content2': content2Settings,
										'callback': function() { $rootScope.$apply(); }
									});
								}
							});
						}
					}
				});



				log.post('map', { 'sender': 'mainGoogleMap.init', 'info': 'done initializing map' });
				if (callback) { callback(); }
			},
			isInitialized: function() {

				if (mainGoogleMap.instance) { return true; } else { return false; }
			},
			setup: function(args, successCallback, failCallback) {

				map.isReadyToSetup({ 'mapServiceObject': mainGoogleMap }, function() {

					// Map setting up

					infoWindow.close();
					infoWindow.init();
					mainGoogleMap.clearMarkers();
					circle.remove();

					mainGoogleMap.addMarkers(args.mapMarkers, function() {

						if (circle.centerMarker) {

							if (args.radius) {
								circle.show(args);
								mainGoogleMap.instance.setCenter(new google.maps.LatLng(circle.centerMarker.latitude, circle.centerMarker.longitude));
								mainGoogleMap.instance.fitBounds(circle.instance.getBounds());

							} else {
								mainGoogleMap.instance.setCenter(new google.maps.LatLng(circle.centerMarker.latitude, circle.centerMarker.longitude));
								mainGoogleMap.instance.fitBounds(mainGoogleMap.bounds);
							}

						} else {
							mainGoogleMap.instance.setCenter(args.mapOptions.center);
							mainGoogleMap.instance.setZoom(args.mapOptions.zoom);
						}

						log.post('map', { 'sender': 'mainGoogleMap.setup', 'info': 'done setting up map' });
						if (successCallback) { successCallback(); }
					});

				}, function() {

					// Cannot setup google map
					log.post('map', { 'sender': 'mainGoogleMap.setup', 'info': 'could not setup map' });
					failCallback();
				});
			},
			fireReadyChecking: function(callback) {

				var googleMapReadyInteval = $interval(function() {

					switch (mainGoogleMap.isReadyToShow()) {

						case true:
							$interval.cancel(googleMapReadyInteval);
							if (callback) { callback(); }
							break;

						case false: break;
					}

				}, map.readyIntervalTime);
			},
			isReadyToShow: function() {

				var result;

				if (mainGoogleMap.tilesLoaded) { result = true; } else { result = false; }
				log.post('map', { 'sender': 'mainGoogleMap.isReadyToShow', 'result': result });

				return result;
			},
			refresh: function() {

				if (mainGoogleMap.isInitialized()) {
					log.post('map', { 'sender': 'mainGoogleMap.refresh', 'info': 'done refreshing map' });
					$timeout(function() { google.maps.event.trigger(mainGoogleMap.instance, 'resize'); });
				}
			},
			dispose: function() {

				mainGoogleMap.clearMarkers();
				mainGoogleMap.tilesLoaded = false;
				circle.remove();
				infoWindow.close();
				mainGoogleMap.instance = undefined;
				$rootScope.$broadcast('$update', { 'content2': { 'mainMapInstance': undefined } });

				log.post('map', { 'sender': 'mainGoogleMap.dispose', 'info': 'done disposing map' });
			},
			addMarkers: function(markers, callback) {

				if (markers) {

					// Resetting bounds
					mainGoogleMap.bounds = new google.maps.LatLngBounds();



					angular.forEach(markers, function(val, index) {

						// Creating marker
					 	mainGoogleMap.markersObjects[index] = new google.maps.Marker({
					 		map: mainGoogleMap.instance,
					 		position: new google.maps.LatLng(markers[index].latitude, markers[index].longitude),
					 		title: markers[index].name,
					 		id: markers[index].id
					 	});

					 	// Setting marker icon
					 	mainGoogleMap.markersObjects[index].setIcon(map.markerIconUrl);

					 	// On marker click
					 	mainGoogleMap.markersObjects[index].addListener('click', function() {

					 		infoWindow.close();
					 		var current = this;

					 		// If infoWindow hidden
					 		if (mainGoogleMap.activeMarker === undefined) {
					 			infoWindow.show(val, current);

					 		} else {
					 			if (current.id != mainGoogleMap.activeMarker.id) {
					 				infoWindow.show(val, current);
					 			} else {
					 				mainGoogleMap.activeMarker = undefined;
					 				$rootScope.$broadcast('$update', { 'content2': { 'activeMarker': undefined } });
					 			}
					 		}
					 	});

					 	// Adding to map bounds
					 	mainGoogleMap.bounds.extend(mainGoogleMap.markersObjects[index].getPosition());



					 	if (index == markers.length - 1) {
					 		log.post('map', { 'sender': 'mainGoogleMap.addMarkers', 'info': 'done adding markers' });
					 		if (callback) { callback(); }
					 	}
					});

				} else {

					log.post('map', { 'sender': 'mainGoogleMap.addMarkers', 'info': 'no markers to add' });
					if (callback) { callback(); }
				}
			},
			clearMarkers: function() {

				if (mainGoogleMap.markersObjects.length > 0) {
					log.post('map', { 'sender': 'mainGoogleMap.clearMarkers', 'info': 'done clearing markers' });
					angular.forEach(mainGoogleMap.markersObjects, function(val, index) { mainGoogleMap.markersObjects[index].setMap(null); });
					mainGoogleMap.markersObjects = [];
				}
			}
		};

		var infoWindow = {

			htmlViewUrl: 'views/infoWindow.html',
			instance: undefined,

			init: function() {

				infoWindow.instance = new InfoBox({
					'alignBottom': true,
					'disableAutoPan': false,
					'maxWidth': $(window).width() / 2,
					'pixelOffset': new google.maps.Size(-50, -50),
					'zIndex': null,
					'boxStyle': {
						//'background': '',
						//'width': '',
						'opacity': 1
					},
					//'closeBoxMargin': '',
					'closeBoxURL': '',
					'infoBoxClearance': new google.maps.Size(1, 1),
					'isHidden': false,
					'pane': 'floatPane',
					'enableEventPropagation': false
				});
			},
			show: function (val, marker) {

				// Updating scope
				mainGoogleMap.activeMarker = val;
				$rootScope.$broadcast('$update', { 'content2': { 'activeMarker': val } });

		 		// Requesting html file
		 		httpService.requestData({'url': infoWindow.htmlViewUrl, 'query': '' }, function(dataReceived) {

		 			// Setting and opening infowindow
		 			var scope = angular.element('body').scope();
		 			var compiled = $compile(dataReceived)(scope);
		 			infoWindow.instance.setContent(compiled[0]);
		 			infoWindow.instance.open(mainGoogleMap.instance, marker);
		 		});
			},
			close: function() {

				if (infoWindow.instance) { infoWindow.instance.close(); }
			}
		};

		var circle = {

			instance: undefined,
			centerMarker: undefined,

			show: function(args) {

				if (circle.centerMarker) {

					circle.instance = new google.maps.Circle({
						'strokeColor': '000000',
						'strokeOpacity': 0,
						'strokeWeight': 0,
						'fillColor': '#000000',
						'fillOpacity': 0.15,
						'clickable': true,
						map: mainGoogleMap.instance,
						center: new google.maps.LatLng(circle.centerMarker.latitude, circle.centerMarker.longitude),
						radius: args.radius * 1000
					});

					circle.instance.addListener('click', function() {
						infoWindow.close();
						mainGoogleMap.activeMarker = undefined;
						$rootScope.$broadcast('$update', { 'content2': { 'activeMarker': undefined } });
					});

					log.post('map', { 'sender': 'circle.show', 'mapOptions': args.mapOptions, 'radius': args.radius, 'info': 'circle visible' });
				}
			},
			remove: function() {

				if (circle.instance) {
					circle.instance.setMap(null);
					circle.instance = undefined;
				}
			},
			setCenterMarker: function(newCenterMarker) {

				if (angular.isDefined(newCenterMarker)) {
					circle.centerMarker = newCenterMarker;
					log.post('map', { 'sender': 'circle.setCenterMarker', 'status': 'done' });

				} else {
					circle.centerMarker = undefined;
				}
			},
			isSetup: function() {

				if (angular.isDefined(circle.instance) && angular.isDefined(circle.centerMarker)) { return true; } else { return false; }
			}
		};

		var smallGoogleMap = {

			name: 'smallGoogleMap',
			defaultMapZoom: 17,
			instance: undefined,
			singleMarkerObject: undefined,

			init: function(args, callback) {

				var mapOptions = {
					'center': { 'lat': Number(args.mapMarker.latitude), 'lng': Number(args.mapMarker.longitude) },
					'zoom': smallGoogleMap.defaultMapZoom
				};

				// Creating map instance
				smallGoogleMap.instance = new google.maps.Map(document.getElementById('smallGoogleMap'), { center: mapOptions.center, zoom: mapOptions.zoom });

				// Binding map events
				smallGoogleMap.instance.addListener('tilesloaded', function() {
					log.post('map', { 'sender': 'smallGoogleMap.$tilesloaded', 'status': 'invoked' });
					if (callback) { callback(); }
				});

				log.post('map', { 'sender': 'smallGoogleMap.init', 'info': 'done initializing map' });
			},
			isInitialized: function() {

				if (smallGoogleMap.instance) { return true; } else { return false; }
			},
			setup: function(mapMarker, successCallback, failCallback) {

				map.isReadyToSetup({ 'mapServiceObject': smallGoogleMap, 'mapMarker': mapMarker }, function() {

					// Map setting up

					smallGoogleMap.clearMarker();
					smallGoogleMap.addMarker(mapMarker, successCallback);
					log.post('map', { 'sender': 'smallGoogleMap.setup', 'info': 'done setting up map' });

				}, function() {

					// Cannot setup google map

					log.post('map', { 'sender': 'smallGoogleMap.setup', 'info': 'could not setup' });
					failCallback();
				});
			},
			refresh: function() {

				log.post('map', { 'sender': 'smallGoogleMap.refresh', 'info': 'done refreshing map' });
				$timeout(function() { google.maps.event.trigger(smallGoogleMap.instance, 'resize'); });
			},
			dispose: function() {

				smallGoogleMap.clearMarker();
				smallGoogleMap.instance = undefined;

				log.post('map', { 'sender': 'smallGoogleMap.dispose', 'info': 'done disposing map' });
			},
			addMarker: function(marker, callback) {

				smallGoogleMap.singleMarkerObject = new google.maps.Marker({
			 		map: smallGoogleMap.instance,
			 		position: new google.maps.LatLng(marker.latitude, marker.longitude),
			 		title: marker.name,
			 		id: marker.id
			 	});

			 	smallGoogleMap.singleMarkerObject.setIcon(map.markerIconUrl);

			 	log.post('map', { 'sender': 'smallGoogleMap.addMarker', 'info': 'done adding marker' });
			 	if (callback) { callback(); }
			},
			clearMarker: function() {

				if (smallGoogleMap.singleMarkerObject) {
					log.post('map', { 'sender': 'smallGoogleMap.clearMarker', 'info': 'done clearing marker' });
					smallGoogleMap.singleMarkerObject.setMap(null);
					smallGoogleMap.singleMarkerObject = undefined;
				}
			}
		};

		return {

			'map': map,
			'marker': marker,
			'mainGoogleMap': mainGoogleMap,
			'infoWindow': infoWindow,
			'circle': circle,
			'smallGoogleMap': smallGoogleMap
		};
	};



	mapService.$inject = ['$rootScope', '$compile', '$parse', '$timeout', '$interval', '$window', '$ionicHistory', 'httpService', 'activeIdService', 'globalService', 'log', 'scripts'];
	angular.module('appModule').service('mapService', mapService);

})();