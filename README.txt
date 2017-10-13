1) when starting developing:
	- set globalService.options.myLocation

2) when deploying final version:
	- uncomment min.js scripts in index.html
	- set globalService.options.allowSendingLogs to false
	
	
	
1. Instalacja NPM, Node.js, Cordova
2. Klon repozytorium
3. Dodanie plarformy Cordova

/civil-connect-solution>cordova platform add android

Jezeło błąd „Error: Source path does not exist: phonegap/ios/icon/icon-72.png”, w pliku /config.xml do atrybutów „src” dodać katalog „www/” na początku ścieżki (oprócz znacznika „content”).

i komenda:
/civil-connect-solution>cordova build

Jeżeli nie było żadnego błędu idziemy dalej.
4. Aktualizacja paczek: 
1. /civil-connect-solution>npm update
2. Instalacja „bower”
3. /civil-connect-solution>bower update
5. Aktualizacja pluginów Cordova
1. cordova < 4
/civil-connect-solution>cordova plugin add net.yoik.cordova.plugins.screenorientation

cordova > 4
/civil-connect-solution>cordova plugin add cordova-plugin-screen-orientation

2. /civil-connect-solution>cordova plugin add cordova-plugin-file
3. /civil-connect-solution>cordova plugin add cordova-plugin-device
4. /civil-connect-solution>cordova plugin add cordova-plugin-inappbrowser
5. /civil-connect-solution>cordova plugin add cordova-plugin-whitelist
6. /civil-connect-solution>cordova plugin add cordova-plugin-geolocation


Przygotowanie paczki APK

1. 

