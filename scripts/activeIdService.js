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