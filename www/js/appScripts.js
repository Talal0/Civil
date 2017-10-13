(function() {

	/**
    	* @ngdoc overview
		* @name ionic
		* @description
		* <a href="http://ionicframework.com" target="new">Link</a>
	**/

	/**
	    * @ngdoc overview
	    * @name ngCordova
	    * @description
	    * <a href="http://ngcordova.com/" target="new">Link</a>
	**/

	/**
	    * @ngdoc overview
	    * @name ngMocks
	    * @description
	    * <a href="https://docs.angularjs.org/api/ngMock" target="new">Link</a>
	    * <p>- inject into appModule only when running tests</p>
	**/




	/**
	     * @ngdoc method
	     * @name config
	     * @methodOf appModule
	     * @description
	     * <p>- mainly defines app routes</p>
	     * @param {service} $ionicConfigProvider from ionic
	     * @param {service} $urlRouterProvider from ui-router
	     * @param {service} $stateProvider from ui-router
	     * @param {service} $compileProvider from angular
	**/
	var config = function($ionicConfigProvider, $urlRouterProvider, $stateProvider, $compileProvider) {

		$ionicConfigProvider.backButton.text('');
		$ionicConfigProvider.views.forwardCache(true);
		$ionicConfigProvider.views.swipeBackEnabled(false);
		$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|geo|tel|maps):/);

		$stateProvider
		.state('root', { url: '/', templateUrl: 'views/root.html' })
		.state('home', { url: '/home', templateUrl: 'views/home.html' })
		.state('content1', { url: '/content1', templateUrl: 'views/content1.html' })
		.state('content2', { url: '/content2', templateUrl: 'views/content2.html' })
		.state('filterWindow', { url: '/filterWindow', templateUrl: 'views/filterWindow.html' })
		.state('content3', { url: '/content3', templateUrl: 'views/content3.html', cache: false });

		$urlRouterProvider.otherwise('/');
	};

	/**
	     * @ngdoc method
	     * @name run
	     * @methodOf appModule
	     * @description
	     * <p>- defines events, most importantly $ionicPlatform.ready event</p>
	     * @param {service} $ionicPlatform from ionic
	     * @param {service} $ionicHistory from ionic
	     * @param {service} $rootScope from angular
	     * @param {service} $window from angular
	     * @param {service} $timeout from angular
	     * @param {service} coreService custom
	     * @param {service} apiDataManager custom
	     * @param {service} log custom
	     * @param {service} gps custom
	**/
	var run = function($ionicPlatform, $ionicHistory, $rootScope, $window, $timeout, coreService, apiDataManager, log, gps) {

		/**
			* @ngdoc event
			* @name registerBackButtonAction
			* @eventOf appModule
			* @description
			* <p>- belongs to $ionicPlatform service of ionic</p>
			* <p>- device back button click event</p>
			* <p>- not available on iOS</p>
		*/
		$ionicPlatform.registerBackButtonAction(function () {

			if (coreService.init.currentOs == 'Android') {
				coreService[$ionicHistory.currentStateName()].handleBackButtonClick(true);
			}
		}, 100);

		/**
			* @ngdoc event
			* @name orientationchange
			* @eventOf appModule
			* @description
			* <p>- belongs to $window from angular</p>
			* <p>- fires up when orientation changes</p>
		*/
		angular.element($window).bind('orientationchange', function () {

			if ($ionicHistory.currentView().stateName == 'content1' || $ionicHistory.currentView().stateName == 'content2' || $ionicHistory.currentView().stateName == 'content3') {
				coreService[$ionicHistory.currentView().stateName].handleOrientationChange();
			}
		});



		/**
			* @ngdoc event
			* @name ready
			* @eventOf appModule
			* @description
			* <p>- belongs to $ionicPlatform service of ionic</p>
			* <p>- fires only once on app startup</p>
			* <p>- cordova object is not defined until this event fires up</p>
		*/
	    $ionicPlatform.ready(function() {

	    	if (window.cordova) {
	    		screen.lockOrientation('portrait');
	    	}

	    	coreService.init.timer();
	    	coreService.init.injectedServices(window);

	    	// Global onMobile flag is set now

	    	log.init();

	    	coreService.init.service(window, screen);
	    	coreService.init.appStyle(window);
	        coreService.appReadiness.fireChecking(undefined, undefined);

			gps.inspect.locationServices(coreService.init.currentOs);
	        apiDataManager.mapStatesAndCategories.fetch();
	        apiDataManager.banners.fetch();

	        $timeout(function() {
	    		$('body').show();
	    		$timeout(function() { $rootScope.$broadcast('$update', { 'root': { backImgVisible: true } }); }, 500);
	    	}, 500);
	    });
	};


	/**
		* @ngdoc object
		* @name appModule
		* @description
		* <p>- this is CivilConnect hybrid application main module</p>
		* @requires ionic
		* @requires ngCordova
		* @requires uiGmapgoogle-maps
		* @requires ngIOS9UIWebViewPatch
		* @requires ngMocks
	**/
	angular.module('appModule', ['ionic', 'angucomplete-alt', 'ngCordova', 'uiGmapgoogle-maps', 'ngIOS9UIWebViewPatch'])
	.config(config)
	.run(run)
	.filter('htmlToPlainText', function($sce) {

		return function(text) { return $sce.trustAsHtml(text); };
	})
	.filter('unique', function() {

		return function(collection, keyname) {
			var output = [], keys = [];
			angular.forEach(collection, function(item) {
				var key = item[keyname];
				if (keys.indexOf(key) === -1) {
					keys.push(key);
					output.push(item);
				}
			});

			return output;
		};
	});
})();
(function() {

	var appModule = angular.module('appModule');

	appModule.directive('advertiseBanner', function() {

		return {
			'restrict ': 'E',
			'templateUrl': 'directives/advertiseBanner/template.html'
		};
	});

	appModule.directive('banners', function() {

		return {
			'restrict': 'E',
			'templateUrl': 'directives/banners/template.html'
		};
	});

	appModule.directive('suburbsAutoComplete', function() {

		return {
			'restrict': 'E',
			'templateUrl': 'directives/suburbsAutoComplete/template.html'
		}
	});
	
	appModule.directive('postalcodes', function() {

		return {
			'restrict': 'E',
			'templateUrl': 'directives/postalcodes/template.html'
		}
	});

})();
(function() {

	var MainAppController = function(coreService, activeIdService, apiDataManager, mapService, hardCodedDataService, log, $rootScope, $scope, $timeout, $state, $ionicScrollDelegate, $ionicModal) {

		// Initializing data
		$scope.app = {
			'currentOs': undefined
		};
		$scope.currentView = {
			'clickEventsOn': true,
			'spinnerVisible': true
		};
		$scope.view = {
			'banners': undefined
		};
		$scope.root = {
			'backImgVisible': false
		};
		$scope.home = {
			'mapImgVisible': false
		};
		$scope.content1 = {
			'topNavTitle': hardCodedDataService.navBarTitle.content1.mapStates,
			'collection': undefined,
			'highlightedItemIndex': undefined
		};
		//mapa
		$scope.content2 = {
			'mainMapInstance': undefined,
			'activeMarker': undefined,
			'mapViewOn': true,
			'noMapInfoVisible': false,
			'mainGoogleMapVisible': false,
			'smallGoogleMapVisible': false,
			'collection': undefined,
			'activeCompanyObject': undefined
		};
		$scope.filterWindow = {
			'gpsPostCode': undefined,
			'myLocationChecked': false,
			'activeFilterValue': undefined,
			'activeRadius': undefined,
		};



		// Initializing events
		$scope.$on('$update', function(e, args) {

			var keys1 = Object.keys(args), keys2, i, j;

			for (i = 0; i < keys1.length; ++i) {

				if (keys1[i] != 'callback') {

					keys2 = Object.keys(args[keys1[i]]);

					for (j = 0; j < keys2.length; ++j) {
						$scope[keys1[i]][keys2[j]] = args[keys1[i]][keys2[j]];
					}
				}
			}

			if (keys1.indexOf('callback') > -1) {
				$timeout(function() { args.callback(); });
			}
		});

		// Loading services data
		$scope.hardCodedData = {
			'view': hardCodedDataService.view,
			'msgDialog': hardCodedDataService.msgDialog
		};
		$scope.activeIdServiceData = { 'company': activeIdService.company };
		$scope.titles = hardCodedDataService.navBarTitle;

		// Loading services methods
		$scope.coreServiceMethods = coreService.scopeMethods;
		$scope.activeIdServiceMethods = { 'getActiveCollectionName': activeIdService.content1.getActiveCollectionName };

		// Binding services events
		coreService.init.serviceEvents(coreService, $rootScope, $scope);

		// Watches
		$scope.$watch('filterWindow.activeOptionName', function (newVal, oldVal) {

			$scope.filterWindow.activeOptionValue = '';
  			if (newVal == 'Suburb') { $scope.filterWindow.activeRadius = undefined; }
  		});
	};

	var SuburbsController = function($rootScope, $scope, apiDataManager) {
		
		
		$scope.objectSelectedCallback = function(item) {
			if (angular.isDefined(item) && angular.isDefined(item.title)) {
				$rootScope.$broadcast('$update', { 'filterWindow': { 'activeFilterValue': item.title } });
				$rootScope.$broadcast('$update', { 'filterWindow': { 'activeFilterValuePostalCode': undefined } });
			}
		};

		$scope.postCodeSuburbInputChanged = function(inputData) {
			$rootScope.$broadcast('$update', { 'filterWindow': { 'activeFilterValue': inputData } });
			$rootScope.$broadcast('$update', { 'filterWindow': { 'activeFilterValuePostalCode': undefined } });
		};



		apiDataManager.suburbs.fetch(function(data) {
			$scope.suburbs = data;

		}, function() {
			$scope.suburbs = undefined;
		});
	};
	
	var PostalcodesController = function($rootScope, $scope, apiDataManager) {

		$scope.objectSelectedCallback = function(item) {
			if (angular.isDefined(item) && angular.isDefined(item.title)) {
				$rootScope.$broadcast('$update', { 'filterWindow': { 'activeFilterValuePostalCode': item.title } });
				$rootScope.$broadcast('$update', { 'filterWindow': { 'activeFilterValue': undefined } });
			}
		};

		$scope.postalCodesInputChanged = function(inputData) {
			$rootScope.$broadcast('$update', { 'filterWindow': { 'activeFilterValuePostalCode': inputData } });
			$rootScope.$broadcast('$update', { 'filterWindow': { 'activeFilterValue': undefined } });
		};



		apiDataManager.postalcodes.fetch(function(data) {
			$scope.postalcodes = data;

		}, function() {
			$scope.postalcodes = undefined;
		});
	};



	MainAppController.$inject = ['coreService', 'activeIdService', 'apiDataManager', 'mapService', 'hardCodedDataService', 'log', '$rootScope', '$scope', '$timeout', '$state', '$ionicScrollDelegate', '$ionicModal'];
	SuburbsController.$inject = ['$rootScope', '$scope', 'apiDataManager'];
	PostalcodesController.$inject = ['$rootScope', '$scope', 'apiDataManager'];

	angular.module('appModule').controller('MainAppController', MainAppController);
	angular.module('appModule').controller('SuburbsController', SuburbsController);
	angular.module('appModule').controller('PostalcodesController', PostalcodesController);

})();
(function() {

	var activeIdService = function($rootScope, globalService, log) {

		var init = {

			service: function(mapStates, categories) {

				mapState.setId(mapStates[0].id);
				category.setId(categories[0].id);
				init.subCategoriesIds(categories, subcategory.ids);

				log.post('id', { 'service': 'initialized' });
			},
			subCategoriesIds: function(collection, objectToWriteTo) {

				for (var i = 0; i < collection.length; ++i) {

					// When subcategory found
					if (angular.isDefined(collection[i].subcategories)) {

						objectToWriteTo[collection[i].id] = {
							'subCategoryId': collection[i].subcategories[0].id
						};

						init.subCategoriesIds(collection[i].subcategories, objectToWriteTo[collection[i].id]);
					}
				}
			}
		};

		var mapState = {

			id: undefined,

			setId: function(mapStateId) {

				if (mapStateId !== mapState.id) {
					mapState.id = mapStateId;
					log.post('id', { 'sender': 'mapState.setId', 'mapState.id': mapStateId });
				}
			},
			getId: function() {

				return mapState.id;
			}
		};

		var category = {

			id: undefined,

			setId: function(categoryId) {

				if (categoryId !== category.id) {
					category.id = categoryId;
					log.post('id', { 'sender': 'category.setId', 'category.id': categoryId });
				}
			},
			getId: function() {

				return category.id;
			}
		};

		var subcategory = {

			ids: {},

			setId: function(idsPathArray, newSubCategoryId) {

				var treeObject = subcategory.ids;

				for (var i = 1; i < idsPathArray.length; ++i) {
					treeObject = treeObject[idsPathArray[i]];
				}

				treeObject.subCategoryId = newSubCategoryId;
				log.post('id', { 'sender': 'subcategory.setId', 'newSubCategoryId': newSubCategoryId, 'ids': subcategory.ids });
			},
			getId: function(idsPathArray) {

				var treeObject = subcategory.ids;

				for (var i = 0; i < idsPathArray.length; ++i) {
					treeObject = treeObject[idsPathArray[i]];
				}

				return treeObject.subCategoryId;
			}
		};

		var company = {

			id: undefined,

			setId: function(companyId) {

				if (companyId !== company.id) {
					company.id = companyId;
					log.post('id', { 'sender': 'company.setId', 'company.id': companyId });
				}
			},
			getId: function() {

				return company.id;
			}
		};

		var content1 = {

			idsPath: [],

			setIdsPath: function(args) {

				var executeOperation = function(options) {

					switch (options.operName) {

						case 'empty':
							if (content1.idsPath.length > 0) {
								content1.idsPath = [];
								log.post('id', { 'sender': 'content1.setIdsPath', 'options': options, 'idsPath': $.extend(true, [], content1.idsPath) });
							}
							break;

						case 'last':
							if (content1.idsPath[content1.idsPath.length - 1] !== options.newId) {
								content1.idsPath[content1.idsPath.length - 1] = options.newId;
								log.post('id', { 'sender': 'content1.setIdsPath', 'options': options, 'idsPath': $.extend(true, [], content1.idsPath) });
							}
							break;

						case 'push':
							content1.idsPath.push(options.newId);
							log.post('id', { 'sender': 'content1.setIdsPath', 'options': options, 'idsPath': $.extend(true, [], content1.idsPath) });
							break;

						case 'pop':
							content1.idsPath.pop();
							log.post('id', { 'sender': 'content1.setIdsPath', 'options': options, 'idsPath': $.extend(true, [], content1.idsPath) });
							break;
					}
				};

				for (var i = 0; i < args.length; ++i) { executeOperation(args[i]); }
			},
			getIdsPath: function(skipLastIndex) {

				var result = [];

				if (skipLastIndex) {

					for (var i = 0; i < content1.idsPath.length - 1; ++i) {
						result[i] = content1.idsPath[i];
					}

				} else {
					result = content1.idsPath;
				}

				return result;
			},
			getLastPathId: function() {

				return content1.idsPath[content1.idsPath.length - 1];
			},
			getActiveCollectionName: function() {

				switch (content1.getIdsPath().length) {

					case 1:
						return 'mapStates';

					case 2:
						return 'categories';

					default:
						return 'subcategories';
				}
			}
		};

		return {

			'init': init,
			'mapState': mapState,
			'category': category,
			'subcategory': subcategory,
			'company': company,
			'content1': content1
		};
	};



	activeIdService.$inject = ['$rootScope', 'globalService', 'log'];
	angular.module('appModule').service('activeIdService', activeIdService);
})();
(function() {

	var apiDataManager = function($rootScope, $q, globalService, httpService, phonesMemoryService, activeIdService, mapService, promise, log, filterService, hardCodedDataService) {

		var initDataInspect = {

			isDone: function() {
				if (mapStatesAndCategories.initDataInspectDone && banners.initDataInspectDone) { return true; } else { return false; }
			},
			markAsNotDone: function(callback) {

				mapStatesAndCategories.initDataInspectDone = false;
				banners.initDataInspectDone = false;
				if (callback) { callback(); }
			}
		};

		var mapStatesAndCategories = {

			mapStatesData: undefined,
			categoriesData: undefined,
			initDataInspectDone: false,

			fetch: function(finalCallBack) {

				mapStatesAndCategories.fetchFromRemote(function(mapStatesArray, categoriesArray) {
					mapStatesAndCategories.storeInVar(mapStatesArray, categoriesArray, true, function() {
						mapStatesAndCategories.updateInPhone(function() {
							mapStatesAndCategories.endFetch(finalCallBack);

						}, function() {
							mapStatesAndCategories.endFetch(finalCallBack);
						});
					});

				}, function() {

					mapStatesAndCategories.fetchFromPhone(function(mapStatesArray, categoriesArray) {
						mapStatesAndCategories.storeInVar(mapStatesArray, categoriesArray, false, function() {
							mapStatesAndCategories.endFetch(finalCallBack);
						});

					}, function() {

						mapStatesAndCategories.fetchFromAppFiles(function(mapStatesArray, categoriesArray) {
							mapStatesAndCategories.storeInVar(mapStatesArray, categoriesArray, true, function() {
								mapStatesAndCategories.updateInPhone(function() {
									mapStatesAndCategories.endFetch(finalCallBack);

								}, function() {
									mapStatesAndCategories.endFetch(finalCallBack);
								});
							});

						}, function() {
							mapStatesAndCategories.endFetch(finalCallBack);
						});
					});
				});
			},
			fetchFromRemote: function(success, error) {
				$q.all([
					promise.create('mapStates api request', httpService.requestData, {
						'url': globalService.init.apiServerAddress,
						'query': mapStatesAndCategories.getMapStatesQueryString()
					}),
					promise.create('categories api request', httpService.requestData, {
						'url': globalService.init.apiServerAddress,
						'query': mapStatesAndCategories.getCategoriesQueryString()
					})

				]).then(function(dataReceived) {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.fetchFromRemote', 'status': 'success' });
					dataReceived[0] = filterService.objectsByAnotherCollection(['name'], dataReceived[0], hardCodedDataService.states);
					success(dataReceived[0], dataReceived[1]);

				}, function() {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.fetchFromRemote', 'status': 'error' });
					error();
				});
			},
			fetchFromPhone: function(success, error) {

				$q.all([
					promise.create('reading mapStates from phone', phonesMemoryService.mapStates.read),
					promise.create('reading categories from phone', phonesMemoryService.categories.read)

				]).then(function(dataReceived) {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.fetchFromPhone', 'status': 'success' });
					success($.parseJSON(dataReceived[0]), $.parseJSON(dataReceived[1]));

				}, function() {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.fetchFromPhone', 'status': 'error' });
					error();
				});
			},
			fetchFromAppFiles: function(success, error) {

				$q.all([
					promise.create('reading default mapStates', httpService.requestData, { 'url': 'localStorage', 'query': '/mapStates.json' }),
					promise.create('reading default categories', httpService.requestData, { 'url': 'localStorage', 'query': '/categories.json' })

				]).then(function(dataReceived) {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.fetchFromAppFiles', 'status': 'success' });
					success(dataReceived[0], dataReceived[1]);

				}, function () {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.fetchFromAppFiles', 'status': 'error' });
					error();
				});
			},
			updateInPhone: function(success, error) {

				$q.all([
					promise.create('saving mapStates to phone', phonesMemoryService.mapStates.save, { fileData: JSON.stringify(mapStatesAndCategories.mapStatesData) }),
					promise.create('saving categories to phone', phonesMemoryService.categories.save, { fileData: JSON.stringify(mapStatesAndCategories.categoriesData) }),
					promise.create('creating mapStates dirs on phone', phonesMemoryService.mapStates.createDirs, { mapStates: mapStatesAndCategories.mapStatesData })

				]).then(function() {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.updateInPhone', 'status': 'success' });
					success();

				}, function() {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.updateInPhone', 'status': 'error' });
					error();
				});
			},
			storeInVar: function(mapStatesArray, categoriesArray, sort, callback) {

				if (sort) {
					mapStatesArray = globalService.sort.objectsByProp('name', mapStatesArray);
					mapStatesAndCategories.sortCategories(categoriesArray);
				}

				mapStatesAndCategories.mapStatesData = mapStatesArray;
				mapStatesAndCategories.categoriesData = categoriesArray;

				log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.storeInVar', 'status': 'done' });
				if (callback) { callback(); }
			},
			endFetch: function(finalCallBack) {

				mapStatesAndCategories.initDataInspectDone = true;
				$rootScope.$broadcast('$afterMapStatesAndCategoriesInitDataInspect');
				if (finalCallBack) { finalCallBack(); }
			},
			getMapStatesQueryString: function() {

				return '/getstates';
			},
			getCategoriesQueryString: function() {

				return '/getcategories';
			},
			getSubCategoriesByIdsPath: function(idsPath, skipLastId) {

				var upperBound = idsPath.length;
				if (skipLastId) { upperBound -= 1; }

				var result = globalService.filter.objectsByPropsValues({ 'id': idsPath[1] }, mapStatesAndCategories.categoriesData);

				for (var i = 2; i < upperBound; ++i) {
					result = globalService.filter.objectsByPropsValues({ 'id': idsPath[i] }, result[0].subcategories);
				}

				return result[0].subcategories;
			},
			sortCategories: function(collection) {

				for (var i = 0; i < collection.length; ++i) {
					if (angular.isDefined(collection[i].subcategories)) { mapStatesAndCategories.sortCategories(collection[i].subcategories); }
				}

				collection = globalService.sort.objectsByProp('name', collection);
			}
		};

		var banners = {

			data: undefined,
			initDataInspectDone: false,

			fetch: function(callback) {

				banners.fetchFromRemote(function(bannersArray) {
					banners.storeInVar(bannersArray, function() {
						banners.endFetch(callback);
					});
				}, function() {
					banners.endFetch(callback);
				});
			},
			fetchFromRemote: function(success, error) {

				$q.all([
					promise.create('banners api request', httpService.requestData, {
						'url': globalService.init.apiServerAddress,
						'query': banners.getQueryString()
					})

				]).then(function(dataReceived) {

					if (dataReceived[0] !== undefined && dataReceived[0].length > 0) {
						log.post('apiDataMgr', { 'sender': 'banners.fetchFromRemote', 'status': 'success' });
						success(dataReceived[0]);

					} else {
						log.post('apiDataMgr', { 'sender': 'banners.fetchFromRemote', 'status': 'data empty or corrupt' });
						error();
					}

				}, function() {
					log.post('apiDataMgr', { 'sender': 'banners.fetchFromRemote', 'status': 'error' });
					error();
				});
			},
			endFetch: function(callback) {

				banners.initDataInspectDone = true;
				if (callback) { callback(); }
			},
			storeInVar: function(bannersArray, callback) {

				banners.data = bannersArray;
				log.post('apiDataMgr', { 'sender': 'banners.storeInVar', 'status': 'done' });
				if (callback) { callback(); }
			},
			getByStateAndCatId: function(mapStateId, catId) {

				var result = [];

				if (angular.isDefined(banners.data)) {

					if (mapStateId === 'active') { mapStateId = activeIdService.mapState.getId(); }

					for (var i = 0; i < banners.data.length; ++i) {

						if (angular.isDefined(catId)) {
							if (banners.data[i].state_id === mapStateId && $.inArray(String(catId), banners.data[i].categories_ids) != -1) {
								result.push(banners.data[i]);
							}

						} else {
							if (banners.data[i].state_id === mapStateId && banners.data[i].on_categories_list == 1) {
								result.push(banners.data[i]);
							}
						}
					}
				}

				log.post('apiDataMgr', { 'sender': 'banners.getByStateAndCatId', 'mapStateId': mapStateId, 'categoryId': catId });
				return result;
			},
			getQueryString: function() {

				return '/getallbanners';
			}
		};

		var suburbs = {

			data: undefined,
			fetch: function(successCallBack, errorCallBack) {

				httpService.requestData({
					'url': globalService.init.apiServerAddress,
					'query': suburbs.getQueryString()

				}, function(dataReceived) {
                	successCallBack(suburbs.data = suburbs.createSuburbsObjects(dataReceived));

				}, function() {
					errorCallBack();
				});
			},
			getPostCodeBySuburb: function(args, successCallBack, errorCallBack) {

				httpService.requestData({
					'url': globalService.init.apiServerAddress,
					'query': suburbs.getQueryString(args)

				}, function(postCode) {
                	successCallBack(postCode.postcode);

				}, function() {
					errorCallBack();
				});
			},
			getQueryString: function(args) {

				if (angular.isDefined(args) && angular.isDefined(args.bySuburb)) {
					return '/getpostcodebysuburb/' + args.activeFilterValue;

				} else {
					return '/getsuburbs';
				}
			},
			createSuburbsObjects: function(data) {

				var result = [];

				for (var i = 0; i < data.suburbs.length; ++i) {
					result[i] = { 'name': data.suburbs[i] };
				}

				return result;
			},
			isValidSuburb: function(phrase) {

				for (var i = 0; i < suburbs.data.length; ++i) {
					if (suburbs.data[i].name === phrase) { return true; }
				}

				return false;
			}
		};
		
		var postalcodes = {

			data: undefined,
			fetch: function(successCallBack, errorCallBack) {

				httpService.requestData({
					'url': globalService.init.apiServerAddress,
					'query': postalcodes.getQueryString()

				}, function(dataReceived) {
                	successCallBack(postalcodes.data = postalcodes.createSuburbsObjects(dataReceived));

				}, function() {
					errorCallBack();
				});
			},
			getQueryString: function(args) {
				return '/getpostalcodes';
			},
			createSuburbsObjects: function(data) {

				var result = [];

				for (var i = 0; i < data.postalcodes.length; ++i) {
					result[i] = { 'name': data.postalcodes[i] };
				}

				return result;
			},
			isValidSuburb: function(phrase) {

				for (var i = 0; i < postalcodes.data.length; ++i) {
					if (postalcodes.data[i].name === phrase) { return true; }
				}

				return false;
			}
		};

		var companies = {

			data: undefined,

			fetch: function(args, finalCallBack) {
				//fetch companies from local storage or remote API
				companies.reset(function() {

					// Doing api request
					if (globalService.init.onMobile !== true || args.forceHttpRequest || !successfulCompaniesRequest.shouldSkipHttpRequest(activeIdService.mapState.getId(), activeIdService.content1.getLastPathId())) {

						companies.fetchFromRemote(function(companiesObject) {
							companies.storeInVar(companiesObject, 'name', function() {
								companies.updateInPhone(function() {
									finalCallBack(companies.data.companies);
								});
							});

						}, function() {
							companies.fetchWithoutHttpRequest(finalCallBack);
						});

					// Skipping api request
					} else {
						log.post('apiDataMgr', { 'sender': 'companies.fetchFromRemote', 'status': 'skipped' });
						companies.fetchWithoutHttpRequest(finalCallBack);
					}
				});
			},
			fetchWithoutHttpRequest: function(finalCallBack) {

				companies.fetchFromPhone(function(companiesObject) {
					companies.storeInVar(companiesObject, undefined, function() {
						finalCallBack(companies.data.companies);
					});

				}, function() {

					companies.fetchFromAppFiles(function(companiesObject) {
						companies.storeInVar(companiesObject, 'name', function() {
							companies.updateInPhone(function() {
								finalCallBack(companies.data.companies);
							});
						});

					}, function() {
						finalCallBack(undefined);
					});
				});
			},
			fetchFromRemote: function(success, error) {

				$q.all([
					promise.create('companies api request', httpService.requestData, {
						'url': globalService.init.apiServerAddress,
						'query': companies.getQueryString(activeIdService.mapState.getId(), activeIdService.content1.getLastPathId())
					})

				]).then(function(dataReceived) {

					if (dataReceived[0].companies !== undefined && dataReceived[0].companies.length > 0) {
						log.post('apiDataMgr', { 'sender': 'companies.fetchFromRemote', 'status': 'success' });
						success(dataReceived[0]);

					} else {
						log.post('apiDataMgr', { 'sender': 'companies.fetchFromRemote', 'status': 'data empty or corrupt' });
						error();
					}

				}, function() {
					log.post('apiDataMgr', { 'sender': 'companies.fetchFromRemote', 'status': 'error' });
					error();
				});
			},
			fetchFromPhone: function(success, error) {

				$q.all([
					promise.create('reading companies from mapStates dir on phone', phonesMemoryService.companies.read, {
						'mapStateName': globalService.filter.objectsByPropsValues({ 'id': activeIdService.mapState.getId() }, mapStatesAndCategories.mapStatesData)[0].name,
						'fileName': activeIdService.content1.getLastPathId()
					})

				]).then(function(dataReceived) {
					log.post('apiDataMgr', { 'sender': 'companies.fetchFromPhone', 'status': 'success' });
					success($.parseJSON(dataReceived[0]));

				}, function() {
					log.post('apiDataMgr', { 'sender': 'companies.fetchFromPhone', 'status': 'error' });
					error();
				});
			},
			fetchFromAppFiles: function(success, error) {

				$q.all([
					promise.create('reading default companies', httpService.requestData, {
						'url': 'localStorage',
						'query': '/' + globalService.filter.objectsByPropsValues({ 'id': activeIdService.mapState.getId() }, mapStatesAndCategories.mapStatesData)[0].name + '/' + activeIdService.content1.getLastPathId() + '.json'
					})

				]).then(function(dataReceived) {
					log.post('apiDataMgr', { 'sender': 'companies.fetchFromAppFiles', 'status': 'success' });
					success(dataReceived[0]);

				}, function() {
					log.post('apiDataMgr', { 'sender': 'companies.fetchFromAppFiles', 'status': 'error' });
					error();
				});
			},
			updateInPhone: function(callback) {

				$q.all([
					promise.create('saving companies to mapStates dir on phone', phonesMemoryService.companies.save, {
						'mapStateName': globalService.filter.objectsByPropsValues({ 'id': activeIdService.mapState.getId() }, mapStatesAndCategories.mapStatesData)[0].name,
						'fileName': activeIdService.content1.getLastPathId(),
						'fileData': JSON.stringify(companies.data)
					})

				]).then(function() {
					log.post('apiDataMgr', { 'sender': 'companies.updateInPhone', 'status': 'success' });
					callback();

				}, function() {
					log.post('apiDataMgr', { 'sender': 'companies.updateInPhone', 'status': 'error' });
					callback();
				});
			},
			storeInVar: function(companiesObject, sortByProp, callback) {

				if (companiesObject !== undefined && companiesObject.companies !== undefined && companiesObject.companies.length > 0) {

					if (sortByProp) {
						companiesObject.companies = globalService.sort.objectsByProp(sortByProp, companiesObject.companies);
					}

					companies.data = companiesObject;
					successfulCompaniesRequest.storeIds();

					log.post('apiDataMgr', { 'sender': 'companies.storeInVar', 'status': 'done' });
					if (callback) { callback(); }

				} else { companies.reset(); }
			},
			reset: function(callback) {

				log.post('apiDataMgr', { 'sender': 'companies.reset', 'status': 'done' });
				companies.data = undefined;
				if (callback) { callback(); }
			},
			getQueryString: function(mapStateId, categoryId) {
				return '/getbycategory/' + categoryId + '/getbystate/' + mapStateId;
			},
			getById: function(id) {

				var filteredArray;
				if (id === 'active') { id = activeIdService.company.getId(); }

				filteredArray = globalService.filter.objectsByPropsValues({ 'id': id }, companies.data.companies);
				return filteredArray[0];
			},
			getArrayOfFieldsFromCurrentCompanies: function(field, lowerCase) {

				var result = [];
				var currentCompanies = companies.data;

				if (currentCompanies !== undefined && currentCompanies.length > 0) {

					for (var i = 0; i < currentCompanies.length; ++i) {
						if (lowerCase) { result[i] = currentCompanies[i][field].toLowerCase(); } else { result[i] = currentCompanies[i][field]; }
					}

				} else { result = undefined; }

				return result;
			}
		};

		var filteredCompanies = {

			fetch: function(args, finalCallBack) {

				companies.reset(function() {

					filteredCompanies.fetchFromRemote(args, function(companiesObject) {
						companies.storeInVar(companiesObject, 'distance', function() {
							
							//set center of circle
							var firstCompany = companies.data.companies[0];
							
							var circleCenter = {latitude: 0, longitude: 0};
							if(angular.isDefined(args.lat) && angular.isDefined(args.lng)){
								circleCenter.latitude = args.lat;
								circleCenter.longitude = args.lng;
							}else{
								var geocoder = new google.maps.Geocoder();
								geocoder.geocode({address: firstCompany.country_name + ', ' + firstCompany.county + ', ' + args.activeFilterValue},
								    function(results_array, status) { 
										circleCenter.latitude = results_array[0].geometry.location.lat();
										circleCenter.longitude = results_array[0].geometry.location.lng();
								});
							}
							

							mapService.circle.setCenterMarker(circleCenter);
							finalCallBack(companies.data.companies);
						});

					}, function() {
						mapService.circle.setCenterMarker(undefined);
						companies.storeInVar(undefined);
						finalCallBack(undefined);
					});
				});
			},
			fetchFromRemote: function(args, success, error) {

				$q.all([
					promise.create('filtered companies api request', httpService.requestData, {
						'url': globalService.init.apiServerAddress,
						'query': filteredCompanies.getQueryString(args)
					})

				]).then(function(dataReceived) {

					if (dataReceived[0].companies !== undefined && dataReceived[0].companies.length > 0) {
						log.post('apiDataMgr', { 'sender': 'filteredcompanies.fetchFromRemote', 'status': 'success' });
						success(dataReceived[0]);

					} else {
						log.post('apiDataMgr', { 'sender': 'filteredcompanies.fetchFromRemote', 'status': 'data empty or corrupt' });
						error();
					}

				}, function() {
					log.post('apiDataMgr', { 'sender': 'filteredcompanies.fetchFromRemote', 'status': 'error' });
					error();
				});
			},
			getQueryString: function(args) {
				
				//check if category is selected
				var stateId = activeIdService.mapState.getId();
				var categoryId = activeIdService.content1.getLastPathId();

				if (angular.isDefined(args.lat) && angular.isDefined(args.lng) && angular.isDefined(stateId) && angular.isDefined(categoryId)) {
					return '/getbyradius/' + args.radius + '/lat/' + args.lat + '/lng/' + args.lng + '/state/' + stateId + '/category/' + categoryId;

				} else if (angular.isDefined(args.activeFilterValue) && angular.isDefined(stateId) && angular.isDefined(categoryId)) {
					return '/getbyradius/' + args.radius + '/postcode/' + args.activeFilterValue + '/state/' + stateId + '/category/' + categoryId;
				}else if (angular.isDefined(args.lat) && angular.isDefined(args.lng)) {
					return '/getbyradius/' + args.radius + '/lat/' + args.lat + '/lng/' + args.lng;

				} else if (angular.isDefined(args.activeFilterValue)) {
					return '/getbyradius/' + args.radius + '/postcode/' + args.activeFilterValue;
				}
			},
		};

		var successfulCompaniesRequest = {

			ids: {},

			storeIds: function() {

				var mapStateId = activeIdService.mapState.getId();
				var categoryId = activeIdService.content1.getLastPathId();

				if (successfulCompaniesRequest.ids[mapStateId] !== undefined) {
					if ($.inArray(categoryId, successfulCompaniesRequest.ids[mapStateId]) == -1) {
						successfulCompaniesRequest.ids[mapStateId].push(categoryId);
					}

				} else {
					successfulCompaniesRequest.ids[mapStateId] = [categoryId];
				}
			},
			shouldSkipHttpRequest: function(mapStateId, categoryId) {

				if (successfulCompaniesRequest.ids[mapStateId] !== undefined && $.inArray(categoryId, successfulCompaniesRequest.ids[mapStateId]) > -1) {
					return true;
				} else { return false; }
			}
		};

		return {

			'initDataInspect': initDataInspect,
			'mapStatesAndCategories': mapStatesAndCategories,
			'banners': banners,
			'suburbs': suburbs,
			'postalcodes': postalcodes,
			'companies': companies,
			'filteredCompanies': filteredCompanies,
			'successfulCompaniesRequest': successfulCompaniesRequest
		};
	};



	apiDataManager.$inject = ['$rootScope', '$q', 'globalService', 'httpService', 'phonesMemoryService', 'activeIdService', 'mapService', 'promise', 'log', 'filterService', 'hardCodedDataService'];
	angular.module('appModule').service('apiDataManager', apiDataManager);

})();
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
								content1.setup(function(){
									
										activeIdService.mapState.setId(mapStates[stateIndex].id);
										activeIdService.content1.setIdsPath([{ 'operName': 'empty' }, { 'operName': 'push', 'newId': mapStates[stateIndex].id }]);
										content1.handleItemChoose({ 'clickedItemId': mapStates[stateIndex].id });
										system.goToAppState('content1')
										
								});
								$timeout(function() { system.lockOrientation('unlock'); }, 500);
							});

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

						var center;
						
						if(gps.opt.usersLocation === undefined){
							center = hardCodedMapStateObject.center;
						}else{
							center = gps.opt.usersLocation;
						}
						
						mapService.mainGoogleMap.setup({
							'mapOptions': { center: center, zoom: hardCodedMapStateObject.zoom },
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
							'activeFilterValuePostalCode': undefined,
							'radius': scope.filterWindow.activeRadius
						};

					} else {
						
						if (angular.isDefined(scope.filterWindow.activeFilterValuePostalCode)) {
							options = {
								'objectName': 'filteredCompanies',
								'forceHttpRequest': true,
								'lat': undefined,
								'lng': undefined,
								'activeFilterValue': undefined,
								'activeFilterValuePostalCode': scope.filterWindow.activeFilterValuePostalCode,
								'radius': scope.filterWindow.activeRadius
							};
						}else{
							options = {
								'objectName': 'filteredCompanies',
								'forceHttpRequest': true,
								'lat': undefined,
								'lng': undefined,
								'activeFilterValue': scope.filterWindow.activeFilterValue,
								'activeFilterValuePostalCode': undefined,
								'radius': scope.filterWindow.activeRadius
							};
						}
					}

					log.post('nav', { 'sender': 'filterWindow.handleSearchButtonClick', 'args': options, 'clickEventsOn': scope.currentView.clickEventsOn });

					filterWindow.validateInput(options, function(args) {

						//set filter by postalcode
					    if (angular.isDefined(args.byPostalcode)) {
							
							postCode = args.activeFilterValuePostalCode;
							if (angular.isDefined(postCode)) {
								
								args.activeFilterValue = postCode;
								endingProcedures(args);

							} else {
								msgDialogService.showMsgDialog('$getPostCodeBySuburbError');
							}
							
							
						}else if (angular.isDefined(args.bySuburb)) {

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
				
				//if filter by postalcode
				if(angular.isDefined(args.activeFilterValuePostalCode)){
					//
					args.byPostalcode = true;
					args.bySuburb = undefined;
				}
				// When filtering by postcode or suburb
				else if (angular.isDefined(args.activeFilterValue)) {

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
					} else { args.bySuburb = true;args.byPostalcode = undefined; }
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
(function() {

	var filterService = function() {

		var objectsByAnotherCollection = function(propsNamesToCompare, collectionToFilter, collectionToCompareWith) {

			var result = [];

			// For every prop name
			for (var i = 0; i < propsNamesToCompare.length; ++i) {

				// For every object from collectionToFilter
				for (var j = 0; j < collectionToFilter.length; ++j) {

					// For every object from collectionToCompareWith
					for (var k = 0; k < collectionToCompareWith.length; ++k) {

						// When both object have the property defined
						if (collectionToFilter[j][propsNamesToCompare[i]] !== undefined && collectionToCompareWith[k][propsNamesToCompare[i]] !== undefined) {

							// When props on both objects have the same value
							if (collectionToFilter[j][propsNamesToCompare[i]] === collectionToCompareWith[k][propsNamesToCompare[i]]) {

								result.push(collectionToFilter[j]);
							}
						}
					}
				}
			}

			return result;
		};
		var objectsProps = function(target, propsToInclude) {

			var i, j;
			var result;

			// Target is an object
			if (!angular.isArray(target)) {

				result = {};

				// For every prop in propsToInclude
				for (i = 0; i < propsToInclude.length; ++i) {
					result[propsToInclude[i]] = target[propsToInclude[i]];
				}

			// Target is an array of objects
			} else {

				result = [];

				// For every array object
				for (i = 0; i < target.length; ++i) {

					var obj = {};

					// For every prop in propsToInclude
					for (j = 0; j < propsToInclude.length; ++j) {
						obj[propsToInclude[j]] = target[i][propsToInclude[j]];
					}

					result.push(obj);
				}
			}

			return result;
		};

		return {
			objectsByAnotherCollection: objectsByAnotherCollection,
			objectsProps: objectsProps
		};
	};

	filterService.$inject = [];
	angular.module('appModule').service('filterService', filterService);
})();
(function() {

	var globalService = function($q, $http) {

		var options = {

			// home, work or school (what ip mobile device should be sending logs to)
			'myLocation': 'home',
			'allowSendingLogs': false,
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
					case 'Android': options = { 'enableHighAccuracy': true, 'timeout': 10000 }; break; //
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
(function() {

	var hardCodedDataService = function() {

		return {

			'view': {
				'home': {
					'button1Text': 'Click to select state'
				},
				'infoWindow': {
					'viewMoreButtonText': 'View more'
				},
				'content2': {
					'noItemsInfo': 'No items to display'
				},
				'filterWindow': {
					'winTitle': 'POSTCODE / SUBURB',
					'myLocationCheckBox': {
						'label': 'Use GPS location'
					},
					'option': {
						'label1': 'Postcode',
						'label2': 'Suburb'
					},
					'radius': {
						'label': 'Radius (km)'
					},
					'button': {
						'label1': 'Search',
						'label2': 'Reset'
					}
				},
				'content3': {
					'title1': 'Business details',
					'title2': 'Map view'
				},
				'shared': {
					'text1': 'CIVIL CONNECT SOLUTIONS',
					'logoHref': 'http://civilconnectapp.com.au/',
					'noMapInfo': 'Couldn\'t load map.'
				},
			},
			'navBarTitle': {
				'content1': {
					'mapStates': 'SELECT STATE',
					'categories': 'SELECT CATEGORY',
					'subcategories': 'SELECT SUBCATEGORY'
				},
				'content2': 'RESULTS',
				'content3': 'DETAILS'
			},
			'msgDialog': {
				'titles': {
					'title1': 'Info',
					'title2': 'Filter'
				},
				'messages': {
					'message1': 'We were unable to determine state you\'re in, you have to select it manually.',
					'message2': 'There\'s nothing to be filtered.',
					'message3': 'Wrong postcode or suburb. If you cannot find suburb enter 4-digit postcode number.',
					'message4': 'Error getting postcode of the suburb you have chosen.',
					'message5': 'Radius should be between 1 and 99 km.',
					'message6': 'Wrong input for suburb.'
				},
				'buttonLabels': {
					'label1': 'Got it',
					'label2': 'Cancel',
					'label3': 'OK'
				}
			},
			'states': [
				{
		            'id': 1,
		            'name': 'ACT',
		            'center': { 'lat': -35.528048, 'lng': 148.590088 },
		            'zoom': 6
		        },
				{
		            'id': 2,
		            'name': 'NSW',
		            'center': { 'lat': -33.632916, 'lng': 146.711426 },
		            'zoom': 5
		        },
				{
		            'id': 3,
		            'name': 'NT',
		            'center': { 'lat': -19.165925, 'lng': 133.615722 },
		            'zoom': 5
		        },
		        {
		            'id': 4,
		            'name': 'QLD',
		            'center': { 'lat': -21.227942, 'lng': 145.437011 },
		            'zoom': 5
		        },
		        // {
		        // 	'id': 5,
		        //     'name': 'Rocks ',
		        //     'center': { 'lat': -25.984993, 'lng': 133.628704 },
		        //     'zoom': 4
		        // },
		        {
		            'id': 6,
		            'name': 'SA',
		            'center': { 'lat': -31.484894, 'lng': 134.890136 },
		            'zoom': 5
		        },
		        {
		            'id': 7,
		            'name': 'TAS',
		            'center': { 'lat': -42.163403, 'lng': 146.524658 },
		            'zoom': 7
		        },
		        {
		            'id': 8,
		            'name': 'VIC',
		            'center': { 'lat': -36.844461, 'lng': 145.217285 },
		            'zoom': 6
		        },
		        {
		            'id': 9,
		            'name': 'WA',
		            'center': { 'lat': -26.135714, 'lng': 121.486816 },
		            'zoom': 5
		        }
		    ]
		};
	};



	angular.module('appModule').service('hardCodedDataService', hardCodedDataService);

})();
(function() {

	var httpService = function($rootScope, $http, globalService, log) {

		var httpTimeOut = 100000;

		return {

			requestData: function(args, successCallBack, errorCallBack) {

				$http.get(args.url + args.query, { timeout: httpTimeOut })
				.success(function(dataReceived, status, headers, config) {

					if (successCallBack) { successCallBack(dataReceived); }
					log.post('http', { 'status': status, 'args': args, 'dataReceived': { 'type': jQuery.type(dataReceived), 'length': dataReceived.length } });
				})
				.error(function(dataReceived, status, headers, config) {

					if (errorCallBack) { errorCallBack(); }
					log.post('http', { 'status': status, 'args': args, 'dataReceived': { 'type': jQuery.type(dataReceived) } });
				});
			}
		};
	};



	httpService.$inject = ['$rootScope', '$http', 'globalService', 'log'];
	angular.module('appModule').service('httpService', httpService);

})();
(function() {

	var log = function($rootScope, $http, $timeout, globalService) {

		var urls = {
			
			'home': 'http://192.168.0.103:7100',
			'work': 'http://192.168.1.20:7100',
			'school': ''
		};

		var init = function() {

			reset('app');
			reset('nav');
			reset('id');
			reset('gps');
			reset('http');
			reset('promise');
			reset('apiDataMgr');
			reset('memory');
			reset('dialog');
			reset('map');
		};
		var post = function(routeName, dataToLog) {

			if (globalService.options.allowSendingLogs) {

				var url = '/' + routeName;
				if (globalService.init.onMobile) { url = urls[globalService.options.myLocation] + url; }

				$http({
					url: url,
					method: 'POST',
					data: dataToLog,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		};
		var reset = function(routeName, onMobile) {

			post(routeName, undefined, onMobile);
		};

		return { 'urls': urls, 'init': init, 'post': post, 'reset': reset };
	};

	log.$inject = ['$rootScope', '$http', '$timeout', 'globalService'];
	angular.module('appModule').service('log', log);
})();
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

                        var icon = {
                             url: markers[index].logoLocation, // url
                            scaledSize: new google.maps.Size(50, 50), // scaled size
                         };

                        // Setting marker icon
                        if (markers[index].package_id == 3){
                            if (markers[index].logoLocation == null || markers[index].logoLocation == ''){
                                mainGoogleMap.markersObjects[index].setIcon(map.markerIconUrl);
                            }
                            else{
                                mainGoogleMap.markersObjects[index].setIcon(icon);
                            }
                        }
                        else{
                            mainGoogleMap.markersObjects[index].setIcon(map.markerIconUrl);
                        }


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
(function() {

	var msgDialogService = function($rootScope, $timeout, $cordovaDialogs, globalService, hardCodedDataService, log) {

		var messages = {

			'$locationError': {
				type: 'alert',
				message: hardCodedDataService.msgDialog.messages.message1,
				title: hardCodedDataService.msgDialog.titles.title1,
				buttonArray: [hardCodedDataService.msgDialog.buttonLabels.label1],
				defaultText: undefined,
				callbackAction: '$onLocationErrorAlertClose'
			},
			'$nothingToBeFiltered': {
				type: 'alert',
				message: hardCodedDataService.msgDialog.messages.message2,
				title: hardCodedDataService.msgDialog.titles.title1,
				buttonArray: [hardCodedDataService.msgDialog.buttonLabels.label1],
				defaultText: undefined,
				callbackAction: undefined
			},
			'$wrongFilterData': {
				type: 'alert',
				message: hardCodedDataService.msgDialog.messages.message3,
				title: hardCodedDataService.msgDialog.titles.title1,
				buttonArray: [hardCodedDataService.msgDialog.buttonLabels.label1],
				defaultText: undefined,
				callbackAction: undefined
			},
			'$wrongRadius': {
				type: 'alert',
				message: hardCodedDataService.msgDialog.messages.message5,
				title: hardCodedDataService.msgDialog.titles.title1,
				buttonArray: [hardCodedDataService.msgDialog.buttonLabels.label1],
				defaultText: undefined,
				callbackAction: undefined
			},
			'$getPostCodeBySuburbError': {
				type: 'alert',
				message: hardCodedDataService.msgDialog.messages.message4,
				title: hardCodedDataService.msgDialog.titles.title1,
				buttonArray: [hardCodedDataService.msgDialog.buttonLabels.label1],
				defaultText: undefined,
				callbackAction: undefined
			}
		};

		var showMsgDialog = function(msgKey) {

			globalService.filter.byOnMobileFlag(

			// On Mobile
			function(args) {

				switch (messages[args.msgKey].type) {

					case 'alert':

						$cordovaDialogs.alert(messages[args.msgKey].message, messages[args.msgKey].title, messages[args.msgKey].buttonArray[0])
						.then(function() { actionCallback(args.msgKey); });
						break;

					case 'confirm':

						$cordovaDialogs.confirm(messages[args.msgKey].message, messages[args.msgKey].title, messages[args.msgKey].buttonArray)
						.then(function(dialogResult) { actionCallback(args.msgKey, dialogResult); });
						break;

					case 'prompt':

						$cordovaDialogs.prompt(messages[args.msgKey].message, messages[args.msgKey].title, messages[args.msgKey].buttonArray, messages[args.msgKey].defaultText)
						.then(function(result) { actionCallback(args.msgKey, result.buttonIndex, result.input1); });
						break;
				}

			// On PC
			}, function(args) {

				log.post('dialog', { 'sender': 'showMsgDialog', 'messageObject': messages[msgKey] });

			}, {

				// Args
				msgKey: msgKey
			});
		};

		var actionCallback = function(msgKey, dialogResult, dialogInput) {

			if (messages[msgKey].callbackAction !== undefined) {
				$rootScope.$broadcast(messages[msgKey].callbackAction, { 'dialogResult': dialogResult, 'dialogInput': dialogInput });
			}
		};



		return {

			'showMsgDialog': showMsgDialog
		};
	};



	msgDialogService.$inject = ['$rootScope', '$timeout', '$cordovaDialogs', 'globalService', 'hardCodedDataService', 'log'];
	angular.module('appModule').service('msgDialogService', msgDialogService);

})();
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
(function() {

	var promise = function($q, $http, log) {
		
		return {

			create: function(promiseName, job, args) {

				var deferred = $q.defer();
					
				job(args, function(data) {
					
					// Success
					var asdf = deferred.resolve(data);
					log.post('promise', { 'promiseName': promiseName, 'status': 'resolved' });
				
				}, function() {

					//Error
					deferred.reject();
					log.post('promise', { 'promiseName': promiseName, 'status': 'rejected' });
				});
				
				return deferred.promise;
			}
		};
	};

	promise.$inject = ['$q', '$http', 'log'];
	angular.module('appModule').service('promise', promise);
})();
(function() {

	var scripts = function($rootScope, globalService, log) {

		var options = { getScriptTimeOut: 5000 };

		var urls = {

			'googleApi': 'https://maps.googleapis.com/maps/api/js?sensor=false&callback=onGoogleMapsApiLoaded&amp;language=en',
			'infoBoxLib': 'lib/google-infobox/google-infobox.js',
			'robotoFont': 'https://fonts.googleapis.com/css?family=Roboto'
		};

		var load = {

			mapScripts: function(callback) {

				window.onGoogleMapsApiLoaded = function() {

					log.post('map', { 'sender': 'load.mapScripts', 'info': 'google maps api loaded' });

					other.overrideInsertBeforeMethods();

					$.ajax({
						url: urls.infoBoxLib,
						dataType: 'script',
						timeout: options.getScriptTimeOut,
						success: function() {
							log.post('map', { 'sender': 'load.mapScripts', 'info': 'infobox lib loaded' });
							callback();
						},
						error: function() {
							log.post('map', { 'sender': 'load.mapScripts', 'info': 'could not load infobox lib' });
							callback();
						}
					});
				};

				$.ajax({
					url: urls.googleApi,
					dataType: 'script',
					timeout: options.getScriptTimeOut,
					error: function() {
						log.post('map', { 'sender': 'load.mapScripts', 'info': 'could not load google maps api' });
						callback();
					}
				});
			}
		};

		var other = {

			overrideInsertBeforeMethods: function() {

				var head = document.getElementsByTagName('head')[0];
				var insertBefore = head.insertBefore;

				head.insertBefore = function (newElement, referenceElement) {

				    if (newElement.href && newElement.href.indexOf(urls.robotoFont) === 0) {

				    	log.post('map', { 'sender': 'other.overrideInsertBeforeMethods', 'info': 'prevented Roboto font from loading' });
				        return;
				    }

				    insertBefore.call(head, newElement, referenceElement);
				};
			}
		};

		return { 'options': options, 'urls': urls, 'load': load };
	};

	scripts.$inject = ['$rootScope', 'globalService', 'log'];
	angular.module('appModule').service('scripts', scripts);
})();