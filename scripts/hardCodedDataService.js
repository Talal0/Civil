(function() {

	var hardCodedDataService = function() {

		return {

			'view': {
				'home': {
					'button1Text': 'Click to select state'
				},
				'infoWindow': {
					'viewMoreButtonText': 'View more'
				},
				'content2': {
					'noItemsInfo': 'No items to display'
				},
				'filterWindow': {
					'winTitle': 'POSTCODE / SUBURB',
					'myLocationCheckBox': {
						'label': 'Use GPS location'
					},
					'option': {
						'label': 'Postcode / suburb'
					},
					'radius': {
						'label': 'Radius (km)'
					},
					'button': {
						'label1': 'Search',
						'label2': 'Reset'
					}
				},
				'content3': {
					'title1': 'Business details',
					'title2': 'Map view'
				},
				'shared': {
					'text1': 'CIVIL CONNECT SOLUTIONS',
					'logoHref': 'http://civilconnectapp.com.au/',
					'noMapInfo': 'Couldn\'t load map.'
				},
			},
			'navBarTitle': {
				'content1': {
					'mapStates': 'SELECT STATE',
					'categories': 'SELECT CATEGORY',
					'subcategories': 'SELECT SUBCATEGORY'
				},
				'content2': 'RESULTS',
				'content3': 'DETAILS'
			},
			'msgDialog': {
				'titles': {
					'title1': 'Info',
					'title2': 'Filter'
				},
				'messages': {
					'message1': 'We were unable to determine state you\'re in, you have to select it manually.',
					'message2': 'There\'s nothing to be filtered.',
					'message3': 'Wrong postcode or suburb. If you cannot find suburb enter 4-digit postcode number.',
					'message4': 'Error getting postcode of the suburb you have chosen.',
					'message5': 'Radius should be between 1 and 99 km.',
					'message6': 'Wrong input for suburb.'
				},
				'buttonLabels': {
					'label1': 'Got it',
					'label2': 'Cancel',
					'label3': 'OK'
				}
			},
			'states': [
				{
		            'id': 1,
		            'name': 'ACT',
		            'center': { 'lat': -35.528048, 'lng': 148.590088 },
		            'zoom': 6
		        },
				{
		            'id': 2,
		            'name': 'NSW',
		            'center': { 'lat': -33.632916, 'lng': 146.711426 },
		            'zoom': 5
		        },
				{
		            'id': 3,
		            'name': 'NT',
		            'center': { 'lat': -19.165925, 'lng': 133.615722 },
		            'zoom': 5
		        },
		        {
		            'id': 4,
		            'name': 'QLD',
		            'center': { 'lat': -21.227942, 'lng': 145.437011 },
		            'zoom': 5
		        },
		        // {
		        // 	'id': 5,
		        //     'name': 'Rocks ',
		        //     'center': { 'lat': -25.984993, 'lng': 133.628704 },
		        //     'zoom': 4
		        // },
		        {
		            'id': 6,
		            'name': 'SA',
		            'center': { 'lat': -31.484894, 'lng': 134.890136 },
		            'zoom': 5
		        },
		        {
		            'id': 7,
		            'name': 'TAS',
		            'center': { 'lat': -42.163403, 'lng': 146.524658 },
		            'zoom': 7
		        },
		        {
		            'id': 8,
		            'name': 'VIC',
		            'center': { 'lat': -36.844461, 'lng': 145.217285 },
		            'zoom': 6
		        },
		        {
		            'id': 9,
		            'name': 'WA',
		            'center': { 'lat': -26.135714, 'lng': 121.486816 },
		            'zoom': 5
		        }
		    ]
		};
	};



	angular.module('appModule').service('hardCodedDataService', hardCodedDataService);

})();