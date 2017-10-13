(function() {

	var promise = function($q, $http, log) {
		
		return {

			create: function(promiseName, job, args) {

				var deferred = $q.defer();
					
				job(args, function(data) {

					// Success
					deferred.resolve(data);
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