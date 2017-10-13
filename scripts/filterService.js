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