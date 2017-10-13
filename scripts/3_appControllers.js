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
			}
		};

		$scope.postCodeSuburbInputChanged = function(inputData) {
			$rootScope.$broadcast('$update', { 'filterWindow': { 'activeFilterValue': inputData } });
		};



		apiDataManager.suburbs.fetch(function(data) {
			$scope.suburbs = data;

		}, function() {
			$scope.suburbs = undefined;
		});
	};



	MainAppController.$inject = ['coreService', 'activeIdService', 'apiDataManager', 'mapService', 'hardCodedDataService', 'log', '$rootScope', '$scope', '$timeout', '$state', '$ionicScrollDelegate', '$ionicModal'];
	SuburbsController.$inject = ['$rootScope', '$scope', 'apiDataManager'];

	angular.module('appModule').controller('MainAppController', MainAppController);
	angular.module('appModule').controller('SuburbsController', SuburbsController);

})();