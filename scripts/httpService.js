(function() {

	var httpService = function($rootScope, $http, globalService, log) {

		var httpTimeOut = 15000;

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