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
				console.log("'run method': [device back button pressed]");
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