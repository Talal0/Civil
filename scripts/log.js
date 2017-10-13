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