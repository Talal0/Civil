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