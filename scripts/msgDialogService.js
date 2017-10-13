(function() {

	var msgDialogService = function($rootScope, $timeout, $cordovaDialogs, globalService, hardCodedDataService, log) {

		var messages = {

			'$locationError': {
				type: 'alert',
				message: hardCodedDataService.msgDialog.messages.message1,
				title: hardCodedDataService.msgDialog.titles.title1,
				buttonArray: [hardCodedDataService.msgDialog.buttonLabels.label1],
				defaultText: undefined,
				callbackAction: '$onLocationErrorAlertClose'
			},
			'$nothingToBeFiltered': {
				type: 'alert',
				message: hardCodedDataService.msgDialog.messages.message2,
				title: hardCodedDataService.msgDialog.titles.title1,
				buttonArray: [hardCodedDataService.msgDialog.buttonLabels.label1],
				defaultText: undefined,
				callbackAction: undefined
			},
			'$wrongFilterData': {
				type: 'alert',
				message: hardCodedDataService.msgDialog.messages.message3,
				title: hardCodedDataService.msgDialog.titles.title1,
				buttonArray: [hardCodedDataService.msgDialog.buttonLabels.label1],
				defaultText: undefined,
				callbackAction: undefined
			},
			'$wrongRadius': {
				type: 'alert',
				message: hardCodedDataService.msgDialog.messages.message5,
				title: hardCodedDataService.msgDialog.titles.title1,
				buttonArray: [hardCodedDataService.msgDialog.buttonLabels.label1],
				defaultText: undefined,
				callbackAction: undefined
			},
			'$getPostCodeBySuburbError': {
				type: 'alert',
				message: hardCodedDataService.msgDialog.messages.message4,
				title: hardCodedDataService.msgDialog.titles.title1,
				buttonArray: [hardCodedDataService.msgDialog.buttonLabels.label1],
				defaultText: undefined,
				callbackAction: undefined
			}
		};

		var showMsgDialog = function(msgKey) {

			globalService.filter.byOnMobileFlag(

			// On Mobile
			function(args) {

				switch (messages[args.msgKey].type) {

					case 'alert':

						$cordovaDialogs.alert(messages[args.msgKey].message, messages[args.msgKey].title, messages[args.msgKey].buttonArray[0])
						.then(function() { actionCallback(args.msgKey); });
						break;

					case 'confirm':

						$cordovaDialogs.confirm(messages[args.msgKey].message, messages[args.msgKey].title, messages[args.msgKey].buttonArray)
						.then(function(dialogResult) { actionCallback(args.msgKey, dialogResult); });
						break;

					case 'prompt':

						$cordovaDialogs.prompt(messages[args.msgKey].message, messages[args.msgKey].title, messages[args.msgKey].buttonArray, messages[args.msgKey].defaultText)
						.then(function(result) { actionCallback(args.msgKey, result.buttonIndex, result.input1); });
						break;
				}

			// On PC
			}, function(args) {

				log.post('dialog', { 'sender': 'showMsgDialog', 'messageObject': messages[msgKey] });

			}, {

				// Args
				msgKey: msgKey
			});
		};

		var actionCallback = function(msgKey, dialogResult, dialogInput) {

			if (messages[msgKey].callbackAction !== undefined) {
				$rootScope.$broadcast(messages[msgKey].callbackAction, { 'dialogResult': dialogResult, 'dialogInput': dialogInput });
			}
		};



		return {

			'showMsgDialog': showMsgDialog
		};
	};



	msgDialogService.$inject = ['$rootScope', '$timeout', '$cordovaDialogs', 'globalService', 'hardCodedDataService', 'log'];
	angular.module('appModule').service('msgDialogService', msgDialogService);

})();