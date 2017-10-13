(function() {

	var apiDataManager = function($rootScope, $q, globalService, httpService, phonesMemoryService, activeIdService, mapService, promise, log, filterService, hardCodedDataService) {

		var initDataInspect = {

			isDone: function() {

				if (mapStatesAndCategories.initDataInspectDone && banners.initDataInspectDone) { return true; } else { return false; }
			},
			markAsNotDone: function(callback) {

				mapStatesAndCategories.initDataInspectDone = false;
				banners.initDataInspectDone = false;
				if (callback) { callback(); }
			}
		};

		var mapStatesAndCategories = {

			mapStatesData: undefined,
			categoriesData: undefined,
			initDataInspectDone: false,

			fetch: function(finalCallBack) {

				mapStatesAndCategories.fetchFromRemote(function(mapStatesArray, categoriesArray) {
					mapStatesAndCategories.storeInVar(mapStatesArray, categoriesArray, true, function() {
						mapStatesAndCategories.updateInPhone(function() {
							mapStatesAndCategories.endFetch(finalCallBack);

						}, function() {
							mapStatesAndCategories.endFetch(finalCallBack);
						});
					});

				}, function() {

					mapStatesAndCategories.fetchFromPhone(function(mapStatesArray, categoriesArray) {
						mapStatesAndCategories.storeInVar(mapStatesArray, categoriesArray, false, function() {
							mapStatesAndCategories.endFetch(finalCallBack);
						});

					}, function() {

						mapStatesAndCategories.fetchFromAppFiles(function(mapStatesArray, categoriesArray) {
							mapStatesAndCategories.storeInVar(mapStatesArray, categoriesArray, true, function() {
								mapStatesAndCategories.updateInPhone(function() {
									mapStatesAndCategories.endFetch(finalCallBack);

								}, function() {
									mapStatesAndCategories.endFetch(finalCallBack);
								});
							});

						}, function() {
							mapStatesAndCategories.endFetch(finalCallBack);
						});
					});
				});
			},
			fetchFromRemote: function(success, error) {

				$q.all([
					promise.create('mapStates api request', httpService.requestData, {
						'url': globalService.init.apiServerAddress,
						'query': mapStatesAndCategories.getMapStatesQueryString()
					}),
					promise.create('categories api request', httpService.requestData, {
						'url': globalService.init.apiServerAddress,
						'query': mapStatesAndCategories.getCategoriesQueryString()
					})

				]).then(function(dataReceived) {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.fetchFromRemote', 'status': 'success' });
					dataReceived[0] = filterService.objectsByAnotherCollection(['name'], dataReceived[0], hardCodedDataService.states);
					success(dataReceived[0], dataReceived[1]);

				}, function() {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.fetchFromRemote', 'status': 'error' });
					error();
				});
			},
			fetchFromPhone: function(success, error) {

				$q.all([
					promise.create('reading mapStates from phone', phonesMemoryService.mapStates.read),
					promise.create('reading categories from phone', phonesMemoryService.categories.read)

				]).then(function(dataReceived) {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.fetchFromPhone', 'status': 'success' });
					success($.parseJSON(dataReceived[0]), $.parseJSON(dataReceived[1]));

				}, function() {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.fetchFromPhone', 'status': 'error' });
					error();
				});
			},
			fetchFromAppFiles: function(success, error) {

				$q.all([
					promise.create('reading default mapStates', httpService.requestData, { 'url': 'localStorage', 'query': '/mapStates.json' }),
					promise.create('reading default categories', httpService.requestData, { 'url': 'localStorage', 'query': '/categories.json' })

				]).then(function(dataReceived) {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.fetchFromAppFiles', 'status': 'success' });
					success(dataReceived[0], dataReceived[1]);

				}, function () {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.fetchFromAppFiles', 'status': 'error' });
					error();
				});
			},
			updateInPhone: function(success, error) {

				$q.all([
					promise.create('saving mapStates to phone', phonesMemoryService.mapStates.save, { fileData: JSON.stringify(mapStatesAndCategories.mapStatesData) }),
					promise.create('saving categories to phone', phonesMemoryService.categories.save, { fileData: JSON.stringify(mapStatesAndCategories.categoriesData) }),
					promise.create('creating mapStates dirs on phone', phonesMemoryService.mapStates.createDirs, { mapStates: mapStatesAndCategories.mapStatesData })

				]).then(function() {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.updateInPhone', 'status': 'success' });
					success();

				}, function() {
					log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.updateInPhone', 'status': 'error' });
					error();
				});
			},
			storeInVar: function(mapStatesArray, categoriesArray, sort, callback) {

				if (sort) {
					mapStatesArray = globalService.sort.objectsByProp('name', mapStatesArray);
					mapStatesAndCategories.sortCategories(categoriesArray);
				}

				mapStatesAndCategories.mapStatesData = mapStatesArray;
				mapStatesAndCategories.categoriesData = categoriesArray;

				log.post('apiDataMgr', { 'sender': 'mapStatesAndCategories.storeInVar', 'status': 'done' });
				if (callback) { callback(); }
			},
			endFetch: function(finalCallBack) {

				mapStatesAndCategories.initDataInspectDone = true;
				$rootScope.$broadcast('$afterMapStatesAndCategoriesInitDataInspect');
				if (finalCallBack) { finalCallBack(); }
			},
			getMapStatesQueryString: function() {

				return '/getstates';
			},
			getCategoriesQueryString: function() {

				return '/getcategories';
			},
			getSubCategoriesByIdsPath: function(idsPath, skipLastId) {

				var upperBound = idsPath.length;
				if (skipLastId) { upperBound -= 1; }

				var result = globalService.filter.objectsByPropsValues({ 'id': idsPath[1] }, mapStatesAndCategories.categoriesData);

				for (var i = 2; i < upperBound; ++i) {
					result = globalService.filter.objectsByPropsValues({ 'id': idsPath[i] }, result[0].subcategories);
				}

				return result[0].subcategories;
			},
			sortCategories: function(collection) {

				for (var i = 0; i < collection.length; ++i) {
					if (angular.isDefined(collection[i].subcategories)) { mapStatesAndCategories.sortCategories(collection[i].subcategories); }
				}

				collection = globalService.sort.objectsByProp('name', collection);
			}
		};

		var banners = {

			data: undefined,
			initDataInspectDone: false,

			fetch: function(callback) {

				banners.fetchFromRemote(function(bannersArray) {
					banners.storeInVar(bannersArray, function() {
						banners.endFetch(callback);
					});
				}, function() {
					banners.endFetch(callback);
				});
			},
			fetchFromRemote: function(success, error) {

				$q.all([
					promise.create('banners api request', httpService.requestData, {
						'url': globalService.init.apiServerAddress,
						'query': banners.getQueryString()
					})

				]).then(function(dataReceived) {

					if (dataReceived[0] !== undefined && dataReceived[0].length > 0) {
						log.post('apiDataMgr', { 'sender': 'banners.fetchFromRemote', 'status': 'success' });
						success(dataReceived[0]);

					} else {
						log.post('apiDataMgr', { 'sender': 'banners.fetchFromRemote', 'status': 'data empty or corrupt' });
						error();
					}

				}, function() {
					log.post('apiDataMgr', { 'sender': 'banners.fetchFromRemote', 'status': 'error' });
					error();
				});
			},
			endFetch: function(callback) {

				banners.initDataInspectDone = true;
				if (callback) { callback(); }
			},
			storeInVar: function(bannersArray, callback) {

				banners.data = bannersArray;
				log.post('apiDataMgr', { 'sender': 'banners.storeInVar', 'status': 'done' });
				if (callback) { callback(); }
			},
			getByStateAndCatId: function(mapStateId, catId) {

				var result = [];

				if (angular.isDefined(banners.data)) {

					if (mapStateId === 'active') { mapStateId = activeIdService.mapState.getId(); }

					for (var i = 0; i < banners.data.length; ++i) {

						if (angular.isDefined(catId)) {
							if (banners.data[i].state_id === mapStateId && $.inArray(String(catId), banners.data[i].categories_ids) != -1) {
								result.push(banners.data[i]);
							}

						} else {
							if (banners.data[i].state_id === mapStateId) {
								result.push(banners.data[i]);
							}
						}
					}
				}

				log.post('apiDataMgr', { 'sender': 'banners.getByStateAndCatId', 'mapStateId': mapStateId, 'categoryId': catId });
				return result;
			},
			getQueryString: function() {

				return '/getallbanners';
			}
		};

		var suburbs = {

			data: undefined,
			fetch: function(successCallBack, errorCallBack) {

				httpService.requestData({
					'url': globalService.init.apiServerAddress,
					'query': suburbs.getQueryString()

				}, function(dataReceived) {
                	successCallBack(suburbs.data = suburbs.createSuburbsObjects(dataReceived));

				}, function() {
					errorCallBack();
				});
			},
			getPostCodeBySuburb: function(args, successCallBack, errorCallBack) {

				httpService.requestData({
					'url': globalService.init.apiServerAddress,
					'query': suburbs.getQueryString(args)

				}, function(postCode) {
                	successCallBack(postCode.postcode);

				}, function() {
					errorCallBack();
				});
			},
			getQueryString: function(args) {

				if (angular.isDefined(args) && angular.isDefined(args.bySuburb)) {
					return '/getpostcodebysuburb/' + args.activeFilterValue;

				} else {
					return '/getsuburbs';
				}
			},
			createSuburbsObjects: function(data) {

				var result = [];

				for (var i = 0; i < data.suburbs.length; ++i) {
					result[i] = { 'name': data.suburbs[i] };
				}

				return result;
			},
			isValidSuburb: function(phrase) {

				for (var i = 0; i < suburbs.data.length; ++i) {
					if (suburbs.data[i].name === phrase) { return true; }
				}

				return false;
			}
		};

		var companies = {

			data: undefined,

			fetch: function(args, finalCallBack) {

				companies.reset(function() {

					// Doing api request
					if (globalService.init.onMobile !== true || args.forceHttpRequest || !successfulCompaniesRequest.shouldSkipHttpRequest(activeIdService.mapState.getId(), activeIdService.content1.getLastPathId())) {

						companies.fetchFromRemote(function(companiesObject) {
							companies.storeInVar(companiesObject, 'name', function() {
								companies.updateInPhone(function() {
									finalCallBack(companies.data.companies);
								});
							});

						}, function() {
							companies.fetchWithoutHttpRequest(finalCallBack);
						});

					// Skipping api request
					} else {
						log.post('apiDataMgr', { 'sender': 'companies.fetchFromRemote', 'status': 'skipped' });
						companies.fetchWithoutHttpRequest(finalCallBack);
					}
				});
			},
			fetchWithoutHttpRequest: function(finalCallBack) {

				companies.fetchFromPhone(function(companiesObject) {
					companies.storeInVar(companiesObject, undefined, function() {
						finalCallBack(companies.data.companies);
					});

				}, function() {

					companies.fetchFromAppFiles(function(companiesObject) {
						companies.storeInVar(companiesObject, 'name', function() {
							companies.updateInPhone(function() {
								finalCallBack(companies.data.companies);
							});
						});

					}, function() {
						finalCallBack(undefined);
					});
				});
			},
			fetchFromRemote: function(success, error) {

				$q.all([
					promise.create('companies api request', httpService.requestData, {
						'url': globalService.init.apiServerAddress,
						'query': companies.getQueryString(activeIdService.mapState.getId(), activeIdService.content1.getLastPathId())
					})

				]).then(function(dataReceived) {

					if (dataReceived[0].companies !== undefined && dataReceived[0].companies.length > 0) {
						log.post('apiDataMgr', { 'sender': 'companies.fetchFromRemote', 'status': 'success' });
						success(dataReceived[0]);

					} else {
						log.post('apiDataMgr', { 'sender': 'companies.fetchFromRemote', 'status': 'data empty or corrupt' });
						error();
					}

				}, function() {
					log.post('apiDataMgr', { 'sender': 'companies.fetchFromRemote', 'status': 'error' });
					error();
				});
			},
			fetchFromPhone: function(success, error) {

				$q.all([
					promise.create('reading companies from mapStates dir on phone', phonesMemoryService.companies.read, {
						'mapStateName': globalService.filter.objectsByPropsValues({ 'id': activeIdService.mapState.getId() }, mapStatesAndCategories.mapStatesData)[0].name,
						'fileName': activeIdService.content1.getLastPathId()
					})

				]).then(function(dataReceived) {
					log.post('apiDataMgr', { 'sender': 'companies.fetchFromPhone', 'status': 'success' });
					success($.parseJSON(dataReceived[0]));

				}, function() {
					log.post('apiDataMgr', { 'sender': 'companies.fetchFromPhone', 'status': 'error' });
					error();
				});
			},
			fetchFromAppFiles: function(success, error) {

				$q.all([
					promise.create('reading default companies', httpService.requestData, {
						'url': 'localStorage',
						'query': '/' + globalService.filter.objectsByPropsValues({ 'id': activeIdService.mapState.getId() }, mapStatesAndCategories.mapStatesData)[0].name + '/' + activeIdService.content1.getLastPathId() + '.json'
					})

				]).then(function(dataReceived) {
					log.post('apiDataMgr', { 'sender': 'companies.fetchFromAppFiles', 'status': 'success' });
					success(dataReceived[0]);

				}, function() {
					log.post('apiDataMgr', { 'sender': 'companies.fetchFromAppFiles', 'status': 'error' });
					error();
				});
			},
			updateInPhone: function(callback) {

				$q.all([
					promise.create('saving companies to mapStates dir on phone', phonesMemoryService.companies.save, {
						'mapStateName': globalService.filter.objectsByPropsValues({ 'id': activeIdService.mapState.getId() }, mapStatesAndCategories.mapStatesData)[0].name,
						'fileName': activeIdService.content1.getLastPathId(),
						'fileData': JSON.stringify(companies.data)
					})

				]).then(function() {
					log.post('apiDataMgr', { 'sender': 'companies.updateInPhone', 'status': 'success' });
					callback();

				}, function() {
					log.post('apiDataMgr', { 'sender': 'companies.updateInPhone', 'status': 'error' });
					callback();
				});
			},
			storeInVar: function(companiesObject, sortByProp, callback) {

				if (companiesObject !== undefined && companiesObject.companies !== undefined && companiesObject.companies.length > 0) {

					if (sortByProp) {
						companiesObject.companies = globalService.sort.objectsByProp(sortByProp, companiesObject.companies);
					}

					companies.data = companiesObject;
					successfulCompaniesRequest.storeIds();

					log.post('apiDataMgr', { 'sender': 'companies.storeInVar', 'status': 'done' });
					if (callback) { callback(); }

				} else { companies.reset(); }
			},
			reset: function(callback) {

				log.post('apiDataMgr', { 'sender': 'companies.reset', 'status': 'done' });
				companies.data = undefined;
				if (callback) { callback(); }
			},
			getQueryString: function(mapStateId, categoryId) {

				return '/getbycategory/' + categoryId + '/getbystate/' + mapStateId;
			},
			getById: function(id) {

				var filteredArray;
				if (id === 'active') { id = activeIdService.company.getId(); }

				filteredArray = globalService.filter.objectsByPropsValues({ 'id': id }, companies.data.companies);
				return filteredArray[0];
			},
			getArrayOfFieldsFromCurrentCompanies: function(field, lowerCase) {

				var result = [];
				var currentCompanies = companies.data;

				if (currentCompanies !== undefined && currentCompanies.length > 0) {

					for (var i = 0; i < currentCompanies.length; ++i) {
						if (lowerCase) { result[i] = currentCompanies[i][field].toLowerCase(); } else { result[i] = currentCompanies[i][field]; }
					}

				} else { result = undefined; }

				return result;
			}
		};

		var filteredCompanies = {

			fetch: function(args, finalCallBack) {

				companies.reset(function() {

					filteredCompanies.fetchFromRemote(args, function(companiesObject) {
						companies.storeInVar(companiesObject, 'distance', function() {
							mapService.circle.setCenterMarker(companies.data.companies[0]);
							finalCallBack(companies.data.companies);
						});

					}, function() {
						mapService.circle.setCenterMarker(undefined);
						companies.storeInVar(undefined);
						finalCallBack(undefined);
					});
				});
			},
			fetchFromRemote: function(args, success, error) {

				$q.all([
					promise.create('filtered companies api request', httpService.requestData, {
						'url': globalService.init.apiServerAddress,
						'query': filteredCompanies.getQueryString(args)
					})

				]).then(function(dataReceived) {

					if (dataReceived[0].companies !== undefined && dataReceived[0].companies.length > 0) {
						log.post('apiDataMgr', { 'sender': 'filteredcompanies.fetchFromRemote', 'status': 'success' });
						success(dataReceived[0]);

					} else {
						log.post('apiDataMgr', { 'sender': 'filteredcompanies.fetchFromRemote', 'status': 'data empty or corrupt' });
						error();
					}

				}, function() {
					log.post('apiDataMgr', { 'sender': 'filteredcompanies.fetchFromRemote', 'status': 'error' });
					error();
				});
			},
			getQueryString: function(args) {

				if (angular.isDefined(args.lat) && angular.isDefined(args.lng)) {
					return '/getbyradius/' + args.radius + '/lat/' + args.lat + '/lng/' + args.lng;

				} else if (angular.isDefined(args.activeFilterValue)) {
					return '/getbyradius/' + args.radius + '/postcode/' + args.activeFilterValue;
				}
			},
		};

		var successfulCompaniesRequest = {

			ids: {},

			storeIds: function() {

				var mapStateId = activeIdService.mapState.getId();
				var categoryId = activeIdService.content1.getLastPathId();

				if (successfulCompaniesRequest.ids[mapStateId] !== undefined) {
					if ($.inArray(categoryId, successfulCompaniesRequest.ids[mapStateId]) == -1) {
						successfulCompaniesRequest.ids[mapStateId].push(categoryId);
					}

				} else {
					successfulCompaniesRequest.ids[mapStateId] = [categoryId];
				}
			},
			shouldSkipHttpRequest: function(mapStateId, categoryId) {

				if (successfulCompaniesRequest.ids[mapStateId] !== undefined && $.inArray(categoryId, successfulCompaniesRequest.ids[mapStateId]) > -1) {
					return true;
				} else { return false; }
			}
		};

		return {

			'initDataInspect': initDataInspect,
			'mapStatesAndCategories': mapStatesAndCategories,
			'banners': banners,
			'suburbs': suburbs,
			'companies': companies,
			'filteredCompanies': filteredCompanies,
			'successfulCompaniesRequest': successfulCompaniesRequest
		};
	};



	apiDataManager.$inject = ['$rootScope', '$q', 'globalService', 'httpService', 'phonesMemoryService', 'activeIdService', 'mapService', 'promise', 'log', 'filterService', 'hardCodedDataService'];
	angular.module('appModule').service('apiDataManager', apiDataManager);

})();