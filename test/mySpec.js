describe('civil-connect-solutions', function() {

	var coreService, globalService, apiDataManager, phonesMemoryService, gps, log;

	beforeEach(angular.mock.module('appModule'));

	beforeEach(inject(function(_coreService_, _globalService_, _apiDataManager_, _phonesMemoryService_, _gps_, _log_) {
		coreService = _coreService_;
		globalService = _globalService_;
		apiDataManager = _apiDataManager_;
		phonesMemoryService = _phonesMemoryService_;
		gps = _gps_;
		log = _log_;
	}));

	describe('$ionic ready event', function() {

		beforeEach(function() {
			coreService.init.timer();
			coreService.init.service(window, screen);
			coreService.init.injectedServices(window);
			coreService.init.injectedServices(window);
		});

		it('coreService.init.appStartTime should be defined', function() {
			expect(coreService.init.appStartTime).toBeDefined();
		});

		it('coreService.init.currentOs should be \'Android\'', function() {
			expect(coreService.init.currentOs).toBe('Android');
		});

		it('globalService.init.onMobile should be falsy', function() {
			expect(globalService.init.onMobile).toBeFalsy();
		});

		it('globalService.init.apiServerAddress should be equal to globalService.urls.apiProxy', function() {
			expect(globalService.init.apiServerAddress).toEqual(globalService.urls.apiProxy);
		});		
	});
});