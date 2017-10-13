(function() {

	var coreService = function($rootScope, $timeout, $interval, $q, $ionicHistory, $ionicScrollDelegate, $state, $cordovaDevice, $cordovaNetwork,
								globalService, activeIdService, httpService, mapService, apiDataManager, phonesMemoryService, msgDialogService, hardCodedDataService, log, promise, gps) {

		var system = {

			defaultOs: 'Android',
			minRootViewTime: 5000,

			getScope: function() {

				return angular.element('body').scope();
			},
			getOrientation: function(flag) {

				var width, height;

				if (angular.isUndefined(flag)) {

					width = window.innerWidth;
					height = window.innerHeight;

				} else if (flag == '!') {

					width = window.innerHeight;
					height = window.innerWidth;
				}

				if (height >= width) {
					return 'portrait';

				} else {
					return 'landscape';
				}
			},
			lockOrientation: function(option) {

				globalService.filter.byOnMobileFlag(function() {

					switch (option) {

						case 'current':

							system.lockOrientation(system.getOrientation());
							break;

						case '!current':

							system.lockOrientation(system.getOrientation('!'));
							break;

						case 'portrait':

							init.screenObject.lockOrientation('portrait');
							break;

						case 'landscape':

							init.screenObject.lockOrientation('landscape');
							break;

						case 'unlock':

							init.screenObject.unlockOrientation();
							break;
					}
				});
			},
			closeMobileApp: function() {

				globalService.filter.byOnMobileFlag(function() { navigator.app.exitApp(); });
			},
			openWebPage: function (url) {

				window.open(url, '_blank');
				log.post('nav', { 'sender': 'system.openWebPage', 'url': url });
			},
			goToAppState: function(state) {

				$state.go(state);
				log.post('nav', { 'sender': 'system.goToAppState', 'state': state });
			},
			goBackInAppStateHistory: function(backCount) {

				$ionicHistory.goBack(backCount);
				log.post('nav', { 'sender': 'system.goBackInAppStateHistory', 'current state name': $ionicHistory.currentView().stateName, 'backCount': backCount });
			},
			handleInternetConnectionChange: function() {

				window.google = undefined;
				mapService.mainGoogleMap.dispose();
				mapService.smallGoogleMap.dispose();

				switch ($ionicHistory.currentView().stateName) {

					case 'content2':

						content2.handleReloadIconClick({ 'needToChangeView': false });
						break;

					case 'content3':

						content3.handleBackButtonClick(false, function() {
							content2.handleReloadIconClick({ 'needToChangeView': false });
						});
						break;
				}
			}
		};

		var init = {

			screenObject: undefined,
			currentOs: undefined,
			appStartTime: undefined,

			serviceEvents: function(service, rootScope, scope) {

				var bindMethod = function(eventType, eventName) {
					rootScope.$on(eventName, function(e, args) { service.events[eventType][eventName](scope, args); });
				};

				if (service.events) {
					for (var eventType in service.events) {
						for (var eventName in service.events[eventType]) {
							bindMethod(eventType, eventName);
						}
					}
				}
			},
			service: function(windowObject, screenObject) {

				if (windowObject.cordova) {
					init.currentOs = $cordovaDevice.getPlatform();
					$rootScope.$broadcast('$update', { 'app': { 'currentOs': init.currentOs } });
					init.screenObject = screenObject;
					log.post('app', { 'sender': 'coreService.init.service', 'cordova': 'defined', 'currentOs': init.currentOs });

				} else {
					init.currentOs = system.defaultOs;
					$rootScope.$broadcast('$update', { 'app': { 'currentOs': init.currentOs } });
					log.post('app', { 'sender': 'coreService.init.service', 'cordova': 'undefined', 'currentOs': init.currentOs });
				}
			},
			timer: function() {

				init.appStartTime = new Date().getTime();
			},
			appStyle: function(windowObject) {

				if (windowObject.cordova && windowObject.cordova.plugins.Keyboard) { cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true); }
				if (windowObject.StatusBar) { StatusBar.styleDefault(); }
			},
			injectedServices: function(windowObject) {

				// globalService
				globalService.init.service(windowObject);

				// phonesMemoryService
        		phonesMemoryService.init.service();
			}
		};

		var appReadiness = {

			conditions: {
				'initApiDataInspect': apiDataManager.initDataInspect.isDone,
				'gpsInspect': gps.is.geoCheckDone
			},
			tempConditionsKeys: [],
			appReadyCheckInterval: 1000,

			fireChecking: function(singleConditionIndex, callback) {

				appReadiness.tempConditionsKeys = Object.keys(appReadiness.conditions);

				if (singleConditionIndex !== undefined) {
					appReadiness.tempConditionsKeys = [appReadiness.tempConditionsKeys[singleConditionIndex]];
				}

				$timeout(function() {

					var appReadyInterval = $interval(function() {

						switch (appReadiness.isReady()) {

							case true:
								log.post('app', { 'sender': 'coreService.appReadiness.fireChecking', 'status': 'cancelled' });
								$interval.cancel(appReadyInterval);
								if (!callback) { appReadiness.handleSuccess(); } else { callback(); }
								break;

							case false:
								break;
						}

					}, appReadiness.appReadyCheckInterval);
				}, system.minRootViewTime);
			},
			isReady: function() {

				for (var i = 0; i < appReadiness.tempConditionsKeys.length; ++i) {

					if (!appReadiness.conditions[appReadiness.tempConditionsKeys[i]]()) {
						log.post('app', { 'sender': 'appReadiness.isReady', 'status': false, 'not ready': appReadiness.tempConditionsKeys[i] });
						return false;
					}
				}

				log.post('app', { 'sender': 'appReadiness.isReady', 'status': true, 'evaluated against': appReadiness.tempConditionsKeys });
				return true;
			},
			handleSuccess: function() {

				// Location services off
				if (gps.opt.usersLocation === undefined) {

					appReadiness.mapStateNotKnownCase();

				// Location services on
				} else {

					var args = {
						url: gps.opt.reverseGeoCoding,
						query: gps.opt.usersLocation.lat + ',' + gps.opt.usersLocation.lng
					};

					$q.all([

						promise.create('google location object request', httpService.requestData, args)

					]).then(function(dataReceived) {

						// Success
						log.post('gps', { 'google location object request': 'success' });

						var mapStates = apiDataManager.mapStatesAndCategories.mapStatesData;
						var mapStatesNames = [];

						for (var i = 0; i < mapStates.length; ++i) { mapStatesNames[i] = mapStates[i].name; }

						var stateIndex = gps.inspect.reverseGeoCodingObject(dataReceived[0], mapStatesNames);

						// Proper country and state
						if (stateIndex > -1) {

							var extraDelay = count.extraDelay(system.minRootViewTime, init.appStartTime);

							$rootScope.$broadcast('$update', {
								'currentView': { 'spinnerVisible': false },
								'filterWindow': { 'myLocationChecked': true }
							});

							$timeout(function() {
								system.goToAppState('content1');
								$timeout(function() { system.lockOrientation('unlock'); }, 500);
							});

							activeIdService.mapState.setId(mapStates[stateIndex].id);
							activeIdService.content1.setIdsPath([{ 'operName': 'empty' }, { 'operName': 'push', 'newId': mapStates[stateIndex].id }]);
							content1.handleItemChoose({ 'clickedItemId': mapStates[stateIndex].id });

						} else { appReadiness.mapStateNotKnownCase(); }

					}, function() {

						// Error
						log.post('gps', { 'google location object request': 'error' });
						appReadiness.mapStateNotKnownCase();
					});
				}
			},
			mapStateNotKnownCase: function() {

				log.post('gps', { 'sender': 'appReadiness.mapStateNotKnownCase', 'status': 'invoked' });

				var delay = count.extraDelay(system.minRootViewTime, init.appStartTime);
				gps.opt.usersLocation = undefined;
				globalService.filter.byOnMobileFlag(function() { $rootScope.$broadcast('$update', { 'currentView': { 'clickEventsOn': false } }); });

				$timeout(function() {

					$rootScope.$broadcast('$update', { 'currentView': { 'spinnerVisible': false } });

					$timeout(function() {

						system.goToAppState('home');

						$timeout(function() {
							$rootScope.$broadcast('$update', { 'home': { 'mapImgVisible': true } });
							system.lockOrientation('unlock');
							$timeout(function() {
								msgDialogService.showMsgDialog('$locationError');
							}, 500);
						}, 500);
					});

				}, delay);
			}
		};

		var view = {

			scrollToTop: function(handleName, animate) {

				$timeout(function() {
					$ionicScrollDelegate.$getByHandle(handleName).scrollTo(0, 0, animate);
				});
			},
			centerActiveItem: function(viewName, animate) {

				var scope = system.getScope();

				if (angular.isDefined(scope[viewName].collection)) {

					var done = function(viewName, animate, yOffset) {
						$timeout(function() {
							$ionicScrollDelegate.$getByHandle(viewName + 'Handle').scrollTo(0, yOffset, animate);
						});
					};

					var activeItemId, listHeight, itemHeight;



					switch (viewName) {

						case 'content1':

							activeItemId = activeIdService.content1.getLastPathId();
							listHeight = $('#content1View #listContainer').innerHeight();
							itemHeight = content1.itemHeight;
							break;

						case 'content2':

							activeItemId = activeIdService.company.getId();
							listHeight = $('#content2View #content2ViewGrid #mainArea').innerHeight();
							itemHeight = content2.itemHeight;
							break;
					}

					for (var i = 0; i < scope[viewName].collection.length; ++i) {
						if (scope[viewName].collection[i].id == activeItemId) {

							var yOffset;

							if (i !== 0) {

								if (angular.isDefined(scope.view.banners) && activeIdService.content1.getActiveCollectionName() != 'mapStates') {
									yOffset = (110 + scope.view.banners.length * 110 + itemHeight * (i + 1)) - listHeight / 2 - itemHeight / 2;
									done(viewName, animate, yOffset);

								} else {
									yOffset = (110 + itemHeight * (i + 1)) - listHeight / 2 - itemHeight / 2;
									done(viewName, animate, yOffset);
								}

							} else {

								yOffset = 0;
								done(viewName, animate, yOffset);
							}

							break;
						}
					}
				}
			}
		};

		var home = {

			handleSelectStateButtonClick: function() {

				var scope = system.getScope();

				log.post('nav', { 'sender': 'home.handleSelectStateButtonClick', 'clickEventsOn': scope.currentView.clickEventsOn });

				if (scope.currentView.clickEventsOn) {

					$rootScope.$broadcast('$update', { 'home': { 'mapImgVisible': false } });
					content1.setup(function() { system.goToAppState('content1'); });
				}
			},
			handleBackButtonClick: function(isItDeviceBackButton) {

				var scope = system.getScope();
				log.post('nav', { 'sender': 'home.handleBackButtonClick', 'isItDeviceBackButton': isItDeviceBackButton, 'clickEventsOn': scope.currentView.clickEventsOn });
				if (scope.currentView.clickEventsOn) { system.closeMobileApp(); }
			}
		};

		// Map states, categories and subcategories
		var content1 = {

			itemHeight: 60,

			setup: function(callback) {

				// Getting active map state id
				var activeMapStateId = activeIdService.mapState.getId();

				// Changing path of ids
				activeIdService.content1.setIdsPath([{ 'operName': 'empty' }, { 'operName': 'push', 'newId': activeMapStateId }]);

				// Updating scope with new collection
				content1.updateCollection({ 'collectionName': 'mapStates', 'updatedCollectionActiveItemId': activeMapStateId });

				// Updating navbar title
				$rootScope.$broadcast('$update', {
					'content1': { 'topNavTitle': hardCodedDataService.navBarTitle.content1[activeIdService.content1.getActiveCollectionName()] }
				});

				if (callback) { $timeout(function() { callback(); }); }
			},
			updateCollection: function(args) {

				var newCollection;



				// Getting proper data from apiDataManager
				switch (args.collectionName) {

					// Showing mapStates
					case 'mapStates':

						newCollection = apiDataManager.mapStatesAndCategories.mapStatesData;
						break;

					// Showing categories
					case 'categories':

						newCollection = apiDataManager.mapStatesAndCategories.categoriesData;
						break;

					// Showing subcategories of any level
					case 'subcategories':

						newCollection = apiDataManager.mapStatesAndCategories.getSubCategoriesByIdsPath(args.idsPath, args.skipLastId);
						break;
				}



				$timeout(function() {

					// Updating scope
					if (args.updatedCollectionActiveItemId && args.collectionName) {
						$rootScope.$broadcast('$update', {
							'content1': { 'collection': newCollection, 'highlightedItemIndex': args.updatedCollectionActiveItemId },
							'callback': function() { view.centerActiveItem('content1', true); }
						});

					} else if (args.collectionName) {
						$rootScope.$broadcast('$update', {
							'content1': { 'collection': newCollection },
							'callback': function() { view.centerActiveItem('content1', true); }
						});

					} else if (args.updatedCollectionActiveItemId) {
						$rootScope.$broadcast('$update', {
							'content1': { 'highlightedItemIndex': args.updatedCollectionActiveItemId },
							'callback': function() { view.centerActiveItem('content1', true); }
						});
					}
				});
			},
			handleItemChoose: function(args) {

				// Highlighting clicked element
				$rootScope.$broadcast('$update', { 'content1': { 'highlightedItemIndex': args.clickedItemId } });

				var content1Path = activeIdService.content1.getIdsPath();

				// Going from mapStates to categories
				if (content1Path.length == 1) {

					log.post('nav', { 'sender': 'content1.handleItemChoose', 'going': { 'from': 'mapStates', 'to': 'categories' }});

					// Updates
					$rootScope.$broadcast('$update', {
						'content1': { 'topNavTitle': hardCodedDataService.navBarTitle.content1.categories },
						'view': { 'banners': apiDataManager.banners.getByStateAndCatId(args.clickedItemId) }
					});

					// Updating activeIdService
					activeIdService.mapState.setId(args.clickedItemId);
					activeIdService.content1.setIdsPath([{ 'operName': 'last', 'newId': args.clickedItemId }, { 'operName': 'push', 'newId': activeIdService.category.getId() }]);

					// Updating scope collection
					content1.updateCollection({ 'collectionName': 'categories', 'updatedCollectionActiveItemId': activeIdService.category.getId() });

				// Going to subcategories
				} else if (content1Path.length >= 2) {

					var collectionObject;

					// From categories
					if (content1Path.length == 2) {

						// Updates
						$rootScope.$broadcast('$update', {
							'view': { 'banners': apiDataManager.banners.getByStateAndCatId(activeIdService.mapState.getId(), args.clickedItemId) }
						});

						// Getting categories object
						collectionObject = globalService.filter.objectsByPropsValues({ 'id': args.clickedItemId }, apiDataManager.mapStatesAndCategories.categoriesData)[0];

						// Updating activeIdService
						activeIdService.content1.setIdsPath([{ 'operName': 'last', 'newId': args.clickedItemId }]);
						activeIdService.category.setId(args.clickedItemId);

						// Checking if there's either more subcategories to show or we'll be going straight to content2
						content1.ifMoreSubCategoriesToShow({ 'collectionObject': collectionObject, 'content1Path': content1Path }, function() {
							log.post('nav', { 'sender': 'content1.handleItemChoose', 'going': { 'from': 'categories', 'to': 'subcategories' }});

						}, function() {
							log.post('nav', { 'sender': 'content1.handleItemChoose', 'going': { 'from': 'categories', 'to': 'content2' }});
						});

					// From subcategories of any level
					} else if (content1Path.length >= 3) {

						// Updates
						$rootScope.$broadcast('$update', {
							'view': { 'banners': apiDataManager.banners.getByStateAndCatId(activeIdService.mapState.getId(), args.clickedItemId) }
						});

						// Getting subcategories object
						collectionObject = apiDataManager.mapStatesAndCategories.getSubCategoriesByIdsPath(content1Path, true)[0];

						// Updating activeIdService
						activeIdService.content1.setIdsPath([{ 'operName': 'last', 'newId': args.clickedItemId }]);
						activeIdService.subcategory.setId(activeIdService.content1.getIdsPath(true), args.clickedItemId);

						// Checking if there's either more subcategories to show or we'll be going straight to content2
						content1.ifMoreSubCategoriesToShow({ 'collectionObject': collectionObject, 'content1Path': content1Path }, function() {
							log.post('nav', { 'sender': 'content1.handleItemChoose', 'going': { 'from': 'subcategories', 'to': 'subcategories' }});

						}, function() {
							log.post('nav', { 'sender': 'content1.handleItemChoose', 'going': { 'from': 'subcategories', 'to': 'content2' }});
						});
					}
				}
			},
			ifMoreSubCategoriesToShow: function(args, successCallback, failCallback) {

				// There is more subcategories
				if (angular.isDefined(args.collectionObject.subcategories)) {

					if (successCallback) { successCallback(); }

					// Updating scope collection
					content1.updateCollection({ 'collectionName': 'subcategories', 'idsPath': args.content1Path, 'skipLastId': false });

					// Updating activeIdService
					var filteredContent1Path = [];
					for (var i = 1; i < args.content1Path.length; ++i) { filteredContent1Path[i - 1] = args.content1Path[i]; }
					var subCategoryId = activeIdService.subcategory.getId(filteredContent1Path);
					activeIdService.content1.setIdsPath([{ 'operName': 'push', 'newId': subCategoryId }]);

					// Updating other scope variables
					$rootScope.$broadcast('$update', {
						'content1': {
							'topNavTitle': hardCodedDataService.navBarTitle.content1.subcategories,
							'highlightedItemIndex': subCategoryId
						}
					});

					return true;

				// No more subcategories
				} else {

					if (failCallback) { failCallback(); }

					// Changing view settings
					content2.beforeSetup({ 'needToChangeView': true });

					// Setting up content2
					content2.setup({ 'objectName': 'companies', 'forceHttpRequest': false });
				}
			},
			handleBackButtonClick: function(isItDeviceBackButton) {

				var scope = system.getScope();

				if (scope.currentView.clickEventsOn) {

					var content1Path = activeIdService.content1.getIdsPath();

					switch (content1Path.length) {

						// Currently mapStates on, going to close app
						case 1:

							system.closeMobileApp();
							break;

						// Back to mapStates
						case 2:

							log.post('nav', { 'sender': 'content1.handleBackButtonClick', 'isItDeviceBackButton': isItDeviceBackButton, 'clickEventsOn': scope.currentView.clickEventsOn, 'going': { 'from': 'categories', 'to': 'mapStates' } });

							$rootScope.$broadcast('$update', { 'content1': { 'topNavTitle': hardCodedDataService.navBarTitle.content1.mapStates } });
							activeIdService.content1.setIdsPath([{ 'operName': 'pop' }]);
							content1.updateCollection({ 'collectionName': 'mapStates', 'updatedCollectionActiveItemId': activeIdService.content1.getLastPathId() });
							if (isItDeviceBackButton) { $rootScope.$apply(); }
							break;

						// Back to categories
						case 3:

							log.post('nav', { 'sender': 'content1.handleBackButtonClick', 'isItDeviceBackButton': isItDeviceBackButton, 'clickEventsOn': scope.currentView.clickEventsOn, 'going': { 'from': 'subcategories', 'to': 'categories' } });

							$rootScope.$broadcast('$update', {
								'content1': { 'topNavTitle': hardCodedDataService.navBarTitle.content1.categories },
								'view': { 'banners': apiDataManager.banners.getByStateAndCatId(activeIdService.mapState.getId()) }
							});


							activeIdService.content1.setIdsPath([{ 'operName': 'pop' }]);
							content1.updateCollection({ 'collectionName': 'categories', 'updatedCollectionActiveItemId': activeIdService.content1.getLastPathId() });
							if (isItDeviceBackButton) { $rootScope.$apply(); }
							break;

						// Back to subcategory of any level
						default:

							log.post('nav', { 'sender': 'content1.handleBackButtonClick', 'isItDeviceBackButton': isItDeviceBackButton, 'clickEventsOn': scope.currentView.clickEventsOn, 'going': { 'from': 'subcategories', 'to': 'subcategories' } });

							var idsPath = activeIdService.content1.getIdsPath(true);

							$rootScope.$broadcast('$update', {
								'content1': { 'topNavTitle': hardCodedDataService.navBarTitle.content1.subcategories },
								'view': { 'banners': apiDataManager.banners.getByStateAndCatId(idsPath[idsPath.length - 1]) }
							});

							activeIdService.content1.setIdsPath([{ 'operName': 'pop' }]);
							content1.updateCollection({ 'collectionName': 'subcategories', 'idsPath': activeIdService.content1.getIdsPath() , 'skipLastId': true, 'updatedCollectionActiveItemId': activeIdService.content1.getLastPathId() });
							if (isItDeviceBackButton) { $rootScope.$apply(); }
							break;
					}
				} else {

					log.post('nav', { 'sender': 'content1.handleBackButtonClick', 'isItDeviceBackButton': isItDeviceBackButton, 'clickEventsOn': scope.currentView.clickEventsOn });
				}
			},
			handleRefreshButtonClick: function() {

				var scope = system.getScope();

				log.post('nav', { 'sender': 'content1.handleRefreshButtonClick', 'clickEventsOn': scope.currentView.clickEventsOn });

				if (scope.currentView.clickEventsOn) {

					// Changing view settings
					$rootScope.$broadcast('$update', { 'currentView': { 'clickEventsOn': false, 'spinnerVisible': true } });

					apiDataManager.initDataInspect.markAsNotDone(function() {
						appReadiness.fireChecking(0, function() {

							$timeout(function() {

								$rootScope.$broadcast('$update', {
									'content1': { 'topNavTitle': hardCodedDataService.navBarTitle.content1.mapStates },
									'currentView': { 'spinnerVisible': false, 'clickEventsOn': true },
								});

								content1.setup();

							}, 1000);
						});
					});

					// Getting mapstates, categories and banners
					apiDataManager.mapStatesAndCategories.fetch();
					apiDataManager.banners.fetch();
				}
			},
			handleOrientationChange: function() {

				$timeout(function() { view.centerActiveItem('content1', true); }, 300);
			}
		};

		// Map view and list view
		var content2 = {

			itemHeight: 110,
			isCollectionMapBoundsCheckBeingDone: false,
			noItemsSettings: {
				'collection': [],
				'activeCompanyObject': undefined,
				'companyId': undefined
			},

			beforeSetup: function(args) {

				system.lockOrientation('current');

				$rootScope.$broadcast('$update', {
					'currentView': { 'clickEventsOn': false },
					'content2': {
						'mainGoogleMapVisible': false,
						'mapViewOn': true,
						'noMapInfoVisible': false,
						'collection': undefined
					}
				});

				if (args.needToChangeView) {
					$ionicHistory.nextViewOptions({ 'disableAnimate': true });
					system.goToAppState('content2');
					$timeout(function() { $rootScope.$broadcast('$update', { 'currentView': { 'spinnerVisible': true } }); }, 200);

				} else {
					$timeout(function() { $rootScope.$broadcast('$update', { 'currentView': { 'spinnerVisible': true } }); });
				}
			},
			setup: function(args) {

				log.post('app', { 'sender': 'coreService.content2.setup', 'args': args });



				// Getting companies
				apiDataManager[args.objectName].fetch(args, function(companiesArray) {

					//var bannersArray = apiDataManager.banners.getByStateAndCatId('active');
					var afterSetupSettings = { 'currentView': { 'spinnerVisible': false, 'clickEventsOn': true } };

					$timeout(function() {

						var activeMapStateObject = globalService.filter.objectsByPropsValues({ 'id': activeIdService.mapState.getId() }, apiDataManager.mapStatesAndCategories.mapStatesData)[0];
						var hardCodedMapStateObject = globalService.filter.objectsByPropsValues({ 'name': activeMapStateObject.name.trim() }, hardCodedDataService.states)[0];

						mapService.mainGoogleMap.setup({
							'mapOptions': { center: hardCodedMapStateObject.center, zoom: hardCodedMapStateObject.zoom },
							'mapMarkers': companiesArray,
							'radius': args.radius

						// Map ready
						}, function() {

							mapService.mainGoogleMap.fireReadyChecking(function() {

								if (companiesArray) {

									// Filtering
									content2.doCollectionMapBoundsCheck(companiesArray, function(content2Settings) {
										afterSetupSettings.content2 = content2Settings;
										afterSetupSettings.content2.companyId = content2Settings.companyId;
										afterSetupSettings.content2.mainGoogleMapVisible = true;
										content2.afterSetup(afterSetupSettings);
									});

								} else {

									afterSetupSettings.content2 = content2.noItemsSettings;
									afterSetupSettings.content2.mainGoogleMapVisible = true;
									content2.afterSetup(afterSetupSettings);
								}
							});

						// Could not setup map
						}, function () {

							if (companiesArray) {

								afterSetupSettings.content2 = {
									'collection': companiesArray,
									'activeCompanyObject': companiesArray[0],
									'companyId': companiesArray[0].id,
									'mainGoogleMapVisible': false,
									'noMapInfoVisible': true
								};

								content2.afterSetup(afterSetupSettings);

							} else {

								afterSetupSettings.content2 = content2.noItemsSettings;
								afterSetupSettings.content2.mainGoogleMapVisible = false;
								afterSetupSettings.content2.noMapInfoVisible = true;
								content2.afterSetup(afterSetupSettings);
							}
						});

					}, 1000);
				});
			},
			doCollectionMapBoundsCheck: function(collection, callback) {

				if (!content2.isCollectionMapBoundsCheckBeingDone) {

					content2.isCollectionMapBoundsCheckBeingDone = true;

					var scope = system.getScope();
					if (angular.isUndefined(collection) && angular.isDefined(apiDataManager.companies.data)) {
						collection = apiDataManager.companies.data.companies;
					}

					// If any companies
					if (angular.isDefined(collection) && collection.length > 0) {

						var content2Settings, filteredCompaniesArray = [], newActiveCompanyObject;

						// Getting current map bounds
						var mapBounds = mapService.mainGoogleMap.instance.getBounds();

						// For every object in list
						for (var i = 0; i < collection.length; ++i) {

							// Company being iterated is within map bounds
							if (mapService.marker.isWithinMapBounds(mapBounds, collection[i])) {

								// Adding company object to list
								filteredCompaniesArray.push(collection[i]);
							}
						}

						// If anything was added to filteredCompanies array during loop cycle
						if (filteredCompaniesArray.length > 0) {

							// If there was no active company among companies within map bounds
							if (angular.isUndefined(newActiveCompanyObject)) { newActiveCompanyObject = filteredCompaniesArray[0]; }

							content2Settings = {
								'collection': filteredCompaniesArray,
								'activeCompanyObject': newActiveCompanyObject,
								'companyId': newActiveCompanyObject.id
							};

						// Empty list
						} else {

							content2Settings = content2.noItemsSettings;
						}



						// Finalizing

						log.post('app', {
							'sender': 'coreService.content2.doCollectionMapBoundsCheck',
							'status': 'done',
							'collection.length': collection.length,
							'filteredCompaniesArray.length': filteredCompaniesArray.length
						});

						content2.isCollectionMapBoundsCheckBeingDone = false;
						if (callback) { callback(content2Settings); }

					} else { content2.isCollectionMapBoundsCheckBeingDone = false; }

				} else { log.post('app', { 'sender': 'coreService.content2.doCollectionMapBoundsCheck', 'status': 'beingFiltered' }); }
			},
			afterSetup: function(args) {

				activeIdService.company.setId(args.content2.companyId);

				switch (mapService.mainGoogleMap.isInitialized()) {

					// When google map loaded
					case true:

						args.callback = function() {
							view.centerActiveItem('content2', true);
							system.lockOrientation('unlock');
						};
						$rootScope.$broadcast('$update', args);
						mapService.mainGoogleMap.refresh();
						break;

					// When could not load google map
					case false:

						$timeout(function() {
							args.callback = function() {
								view.centerActiveItem('content2', true);
								system.lockOrientation('unlock');
							};
							$rootScope.$broadcast('$update', args);
							$rootScope.$apply();
						}, 50);

						break;
				}
			},
			handleItemChoose: function(args) {

				log.post('nav', { 'sender': 'content2.handleItemChoose', 'args': args });

				activeIdService.company.setId(args.clickedItemId);

				$rootScope.$broadcast('$update', {
					'currentView': { 'clickEventsOn': false },
					'content2': {
						'noMapInfoVisible': false,
						'smallGoogleMapVisible': false,
						'activeCompanyObject': apiDataManager.companies.getById(args.clickedItemId)
					}
				});

				$timeout(function() {
					system.goToAppState('content3');
					view.scrollToTop('content3Handle', false);
					$timeout(function() {
						$rootScope.$broadcast('$update', { 'currentView': { 'spinnerVisible': true } });
						content3.setup();
					}, 500);
				});
			},
			handleBackButtonClick: function(isItDeviceBackButton) {

				var scope = system.getScope();

				log.post('nav', { 'sender': 'content2.handleBackButtonClick', 'isItDeviceBackButton': isItDeviceBackButton, 'clickEventsOn': scope.currentView.clickEventsOn });

				if (scope.currentView.clickEventsOn) {

					var idsPath = activeIdService.content1.getIdsPath(true);

					$rootScope.$broadcast('$update', {
						'content2': { 'mainGoogleMapVisible': false },
						'view': { 'banners': apiDataManager.banners.getByStateAndCatId(activeIdService.mapState.getId(), idsPath[idsPath.length - 1]) }
					});
					mapService.mainGoogleMap.dispose();

					system.goBackInAppStateHistory(-1);

					$timeout(function() {
						content1.updateCollection({ 'updatedCollectionActiveItemId': activeIdService.content1.getLastPathId() });
					});
				}
			},
			handleAppLogoClick: function() {

				var scope = system.getScope();

				if (scope.currentView.clickEventsOn) {
					system.openWebPage(hardCodedDataService.view.shared.logoHref);
				}
			},
			handleNavPanelIconClick: function(iconName) {

				var scope = system.getScope();

				log.post('nav', { 'sender': 'content2.handleNavPanelIconClick', 'iconName': iconName, 'clickEventsOn': scope.currentView.clickEventsOn });

				if (scope.currentView.clickEventsOn) {

					switch (iconName) {

						case 'stateIcon':

							$rootScope.$broadcast('$update', { 'content2': { 'mainGoogleMapVisible': false } });
							mapService.mainGoogleMap.dispose();

							$timeout(function() {
								content1.setup(function() { system.goBackInAppStateHistory(-1); });
							});

							break;

						case 'postcodeIcon':

							//$rootScope.$broadcast('openModal');
							system.goToAppState('filterWindow');
							break;

						case 'mapIcon':

							$rootScope.$broadcast('$update', { 'content2': { 'mapViewOn': true } });
							break;

						case 'listIcon':

							$rootScope.$broadcast('$update', {
								'content2': { 'mapViewOn': false },
								'callback': function() { view.centerActiveItem('content2', true); }
							});
							break;

						case 'reloadIcon':

							content2.handleReloadIconClick({ 'needToChangeView': false });
							break;
					}
				}
			},
			handleReloadIconClick: function(args) {

				var scope = system.getScope();

				log.post('nav', { 'sender': 'content2.handleReloadIconClick', 'clickEventsOn': scope.currentView.clickEventsOn });

				if (scope.currentView.clickEventsOn) {

					content2.beforeSetup({ 'needToChangeView': args.needToChangeView });
					content2.setup({ 'objectName': 'companies', 'forceHttpRequest': true });
				}
			},
			handleOrientationChange: function(orientation) {

				if (!globalService.options.blockOrientationChangeEvent) {

					globalService.options.blockOrientationChangeEvent = true;

					if (angular.isDefined(orientation)) {
						system.lockOrientation(orientation);

					} else {

						if (init.currentOs == 'Android') {
							system.lockOrientation('!current');

						} else if (init.currentOs == 'iOS') {
							system.lockOrientation('current');
						}
					}



					$rootScope.$broadcast('$update', {
						'currentView': { 'clickEventsOn': false, 'spinnerVisible': true },
						'callback': function() {

							if (mapService.mainGoogleMap.isInitialized()) {

								mapService.infoWindow.close();

								if (!mapService.circle.isSetup()) {

									var scope = system.getScope();

									if (angular.isDefined(scope.filterWindow.activeRadius)) {

										var activeMapStateObject = globalService.filter.objectsByPropsValues({ 'id': activeIdService.mapState.getId() }, apiDataManager.mapStatesAndCategories.mapStatesData)[0];
										var hardCodedMapStateObject = globalService.filter.objectsByPropsValues({ 'name': activeMapStateObject.name.trim() }, hardCodedDataService.states)[0];

										$timeout(function() {

											mapService.mainGoogleMap.instance.setZoom(hardCodedMapStateObject.zoom);
											mapService.mainGoogleMap.instance.setCenter(hardCodedMapStateObject.center);

										}, 500);

									} else {

										$timeout(function() {

											mapService.mainGoogleMap.instance.fitBounds(mapService.mainGoogleMap.bounds);

										}, 500);
									}

									$timeout(function() {

										$rootScope.$broadcast('$doCollectionMapBoundsCheck', {
											'callback': function(content2Settings) {

												activeIdService.company.setId(content2Settings.companyId);

												$rootScope.$broadcast('$update', {
													'content2': content2Settings,
													'callback': function() {

														$rootScope.$broadcast('$update', {
															'currentView': { 'spinnerVisible': false, 'clickEventsOn': true }
														});

														globalService.options.blockOrientationChangeEvent = false;
														system.lockOrientation('unlock');
														view.centerActiveItem('content2', true);
													}
												});
											}
										});

									}, 1000);

								} else {

									$timeout(function() {

										mapService.mainGoogleMap.instance.setCenter(new google.maps.LatLng(mapService.circle.centerMarker.latitude, mapService.circle.centerMarker.longitude));
										mapService.mainGoogleMap.instance.fitBounds(mapService.circle.instance.getBounds());

									}, 500);

									$timeout(function() {

										$rootScope.$broadcast('$doCollectionMapBoundsCheck', {
											'callback': function(content2Settings) {

												activeIdService.company.setId(content2Settings.companyId);

												$rootScope.$broadcast('$update', {
													'content2': content2Settings,
													'callback': function() {

														$rootScope.$broadcast('$update', {
															'currentView': { 'spinnerVisible': false, 'clickEventsOn': true }
														});

														globalService.options.blockOrientationChangeEvent = false;
														system.lockOrientation('unlock');
														view.centerActiveItem('content2', true);
													}
												});
											}
										});

									}, 1000);
								}

							} else {

								$rootScope.$broadcast('$update', {
									'currentView': { 'spinnerVisible': false, 'clickEventsOn': true }
								});

								globalService.options.blockOrientationChangeEvent = false;
								system.lockOrientation('unlock');
								view.centerActiveItem('content2', true);
							}
						}
					});
				}
			}
		};

		// Filter window
		var filterWindow = {

			postCodeRegex: new RegExp('^[0-9]{4}$'),
			suburbRegex: new RegExp('^[a-zA-Z ]+$'),
			radiusRegex: new RegExp('^([1-9]|[1-9][0-9])$'),

			handleBackButtonClick: function() {

				var scope = system.getScope();

				if (scope.currentView.clickEventsOn) {

					$rootScope.$broadcast('$update', {
						'content2': { 'mainGoogleMapVisible': false },
						'callback': function() {

							mapService.mainGoogleMap.refresh();
							system.goBackInAppStateHistory(-1);

							$timeout(function() {

								content2.handleOrientationChange('current');
								$rootScope.$broadcast('$update', { 'content2': { 'mainGoogleMapVisible': true } });

							}, 500);
						}
					});
				}
			},
			handleSearchButtonClick: function() {

				var endingProcedures = function(args) {

					$rootScope.$broadcast('$update', { 'content2': { 'mainGoogleMapVisible': false } });
						system.goBackInAppStateHistory(-1);

						$timeout(function() {
							mapService.mainGoogleMap.refresh();
							content2.beforeSetup({ 'needToChangeView': false });
							content2.setup(args);
						}, 300);
				};



				var scope = system.getScope();

				if (scope.currentView.clickEventsOn) {

					var options = {};

					if (gps.opt.usersLocation && scope.filterWindow.myLocationChecked) {

						options = {
							'objectName': 'filteredCompanies',
							'forceHttpRequest': true,
							'lat': gps.opt.usersLocation.lat,
							'lng': gps.opt.usersLocation.lng,
							'activeFilterValue': undefined,
							'radius': scope.filterWindow.activeRadius
						};

					} else {

						options = {
							'objectName': 'filteredCompanies',
							'forceHttpRequest': true,
							'lat': undefined,
							'lng': undefined,
							'activeFilterValue': scope.filterWindow.activeFilterValue,
							'radius': scope.filterWindow.activeRadius
						};
					}

					log.post('nav', { 'sender': 'filterWindow.handleSearchButtonClick', 'args': options, 'clickEventsOn': scope.currentView.clickEventsOn });

					filterWindow.validateInput(options, function(args) {

						if (angular.isDefined(args.bySuburb)) {

							apiDataManager.suburbs.getPostCodeBySuburb(args, function(postCode) {

								if (angular.isDefined(postCode)) {
									args.activeFilterValue = postCode;
									endingProcedures(args);

								} else {
									msgDialogService.showMsgDialog('$getPostCodeBySuburbError');
								}

							}, function() {
								msgDialogService.showMsgDialog('$getPostCodeBySuburbError');
							});

						} else {
							endingProcedures(args);
						}
					});
				}
			},
			handleResetButtonClick: function() {

				var scope = system.getScope();

				if (scope.currentView.clickEventsOn) {

					$rootScope.$broadcast('$update', { 'content2': { 'mainGoogleMapVisible': false } });
					system.goBackInAppStateHistory(-1);

					$timeout(function() {
						mapService.mainGoogleMap.refresh();
						content2.beforeSetup({ 'needToChangeView': false });
						content2.setup({ 'objectName': 'companies', 'forceHttpRequest': false });
					}, 300);
				}
			},
			validateInput: function(args, successCallback) {

				var scope = system.getScope();

				// When filtering by postcode or suburb
				if (angular.isDefined(args.activeFilterValue)) {

					// When input is not recognized as a suburb name
					if (!apiDataManager.suburbs.isValidSuburb(args.activeFilterValue)) {

						// When input is not proper postcode either
						if (!filterWindow.postCodeRegex.test(args.activeFilterValue)) {
							msgDialogService.showMsgDialog('$wrongFilterData');
							return;

						// When input is a proper postcode name
						} else {
							$rootScope.$broadcast('$update', { 'filterWindow': { 'activeFilterValue': String(args.activeFilterValue).trim() } });
						}

					// When input is a proper suburb name
					} else { args.bySuburb = true; }
				}

				// Validating radius input
				if (!filterWindow.radiusRegex.test(args.radius)) {
					msgDialogService.showMsgDialog('$wrongRadius');

				} else {
					$rootScope.$broadcast('$update', { 'filterWindow': { 'activeRadius': args.radius } });
					successCallback(args);
				}
			}
		};

		// Single company view
		var content3 = {

			setup: function() {

				mapService.smallGoogleMap.setup(apiDataManager.companies.getById('active'), function() {

					// Success
					$timeout(function() {
						$rootScope.$broadcast('$update', {
							'currentView': { 'spinnerVisible': false, 'clickEventsOn': true },
							'content2': { 'smallGoogleMapVisible': true }
						});
						$rootScope.$apply();
					}, 500);

				}, function() {

					// Failed
					$timeout(function() {
						$rootScope.$broadcast('$update', {
							'currentView': { 'spinnerVisible': false, 'clickEventsOn': true },
							'content2': { 'noMapInfoVisible': true }
						});
						$rootScope.$apply();
					}, 500);
				});
			},
			handleBackButtonClick: function(isItDeviceBackButton, callback) {

				var scope = system.getScope();

				log.post('nav', { 'sender': 'content3.handleBackButtonClick', 'isItDeviceBackButton': isItDeviceBackButton, 'clickEventsOn': scope.currentView.clickEventsOn });

				if (scope.currentView.clickEventsOn) {

					$rootScope.$broadcast('$update', { 'content2': { 'smallGoogleMapVisible': false, 'mainGoogleMapVisible': false  }});
					system.goBackInAppStateHistory(-1);

					$timeout(function() {

						if (mapService.mainGoogleMap.isInitialized()) {
							$rootScope.$broadcast('$update', {
								'content2': { 'mainGoogleMapVisible': true  },
								'callback': function() {
									view.centerActiveItem('content2', true);
									mapService.mainGoogleMap.refresh();
								}
							});
						} else {
							$rootScope.$broadcast('$update', {
								'content2': { 'noMapInfoVisible': true  },
								'callback': function() {
									view.centerActiveItem('content2', true);
								}
							});
						}

						if (callback) { callback(); }

					}, 400);
				}
			},
			handleOrientationChange: function() {

				view.scrollToTop('content3Handle', false);

				if (mapService.smallGoogleMap.isInitialized()) {
					var activeCompany = apiDataManager.companies.getById('active');
					$timeout(function() {
						mapService.smallGoogleMap.instance.panTo({ 'lat': Number(activeCompany.latitude), 'lng': Number(activeCompany.longitude) });
					}, 500);
				}
			}
		};

		var is = {

			landscapeOrientationOn: function() {

				if (init.screenObject.orientation.type == 'landscape' || init.screenObject.orientation.type == 'landscape-primary') {
					return true;
				} else {
					return false;
				}
			},
			googleApiLoaded: function() {

				if (window.google) { return true; } else { return false; }
			},
			listItemBanner: function(listItemObject) {

				if (angular.isDefined(listItemObject.big_imag_url)) { return true; } else { return false; }
			}
		};

		var count = {

			extraDelay: function(minTime, start) {

				var timeTaken = new Date().getTime() - start;
				var extraDelay = minTime - timeTaken;
				if (extraDelay < 0) { extraDelay = 0; }
				log.post('app', { 'sender': 'count.extraDelay', 'timeTaken': timeTaken, 'extraDelay': extraDelay });

				return extraDelay;
			}
		};



		var events = {

			'$ionicView': {

				'$ionicView.loaded': function(scope, args) {

					log.post('nav', { 'sender': 'events.$ionicView.loaded', 'args': args });
				},
				'$ionicView.unloaded': function(scope, args) {

					switch (args.stateName) {

						case 'content2':

							$rootScope.$broadcast('$update', { 'content2': { 'mainGoogleMapVisible': false } });
							mapService.mainGoogleMap.dispose();
							break;

						case 'content3':

							$rootScope.$broadcast('$update', { 'content2': { 'smallGoogleMapVisible': false } });
							mapService.smallGoogleMap.dispose('smallGoogleMap');
							break;
					}

					log.post('nav', { 'sender': 'events.$ionicView.unloaded', 'args': args });
				}
			},

			'$cordovaNetwork': {

				'$cordovaNetwork:online': function(scope, args) {

					log.post('app', { 'sender': 'events.$cordovaNetwork', 'args': args, 'status': 'online' });
					system.handleInternetConnectionChange();
				},
				'$cordovaNetwork:offline': function(scope, args) {

					log.post('app', { 'sender': 'events.$cordovaNetwork', 'args': args, 'status': 'offline' });
					system.handleInternetConnectionChange();
				}
			},

			'apiData': {

				'$afterMapStatesAndCategoriesInitDataInspect': function(scope, args) {

					var mapStates = apiDataManager.mapStatesAndCategories.mapStatesData;
					var categories = apiDataManager.mapStatesAndCategories.categoriesData;

					activeIdService.init.service(mapStates, categories);
				}
			},

			'map': {

				'$doCollectionMapBoundsCheck': function(scope, args) {

					content2.doCollectionMapBoundsCheck(args.collection, args.callback);
				}
			},

			'msgDialog': {

				'$onLocationErrorAlertClose': function(scope, args) {

					$rootScope.$broadcast('$update', { 'currentView': { 'clickEventsOn': true } });
				}
			}
		};



		return {

			'system': system,
			'init': init,
			'appReadiness': appReadiness,
			'view': view,
			'home': home,
			'content1': content1,
			'content2': content2,
			'filterWindow': filterWindow,
			'content3': content3,
			'is': is,
			'count': count,
			'events': events,
			'scopeMethods': {
				'openWebPage': system.openWebPage,
				'isGoogleApiLoaded': is.googleApiLoaded,
				'home': {
					'handleSelectStateButtonClick': home.handleSelectStateButtonClick,
					'handleBackButtonClick': home.handleBackButtonClick
				},
				'content1': {
					'handleItemChoose': content1.handleItemChoose,
					'handleBackButtonClick': content1.handleBackButtonClick,
					'handleRefreshButtonClick': content1.handleRefreshButtonClick
				},
				'content2': {
					'handleItemChoose': content2.handleItemChoose,
					'handleBackButtonClick': content2.handleBackButtonClick,
					'handleAppLogoClick': content2.handleAppLogoClick,
					'handleNavPanelIconClick': content2.handleNavPanelIconClick
				},
				'filterWindow': {
					'handleBackButtonClick': filterWindow.handleBackButtonClick,
					'handleSearchButtonClick': filterWindow.handleSearchButtonClick,
					'handleResetButtonClick': filterWindow.handleResetButtonClick
				},
				'content3': {
					'handleBackButtonClick': content3.handleBackButtonClick
				}
			}
		};
	};



	coreService.$inject = [
		'$rootScope', '$timeout', '$interval', '$q', '$ionicHistory', '$ionicScrollDelegate', '$state', '$cordovaDevice', '$cordovaNetwork',
		'globalService', 'activeIdService', 'httpService', 'mapService', 'apiDataManager', 'phonesMemoryService', 'msgDialogService', 'hardCodedDataService', 'log', 'promise', 'gps'
	];
	angular.module('appModule').service('coreService', coreService);
})();