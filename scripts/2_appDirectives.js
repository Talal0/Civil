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

})();