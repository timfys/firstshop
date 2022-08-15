var app = angular.module('defaultApp', ['placeProtocol', 'leafletPlaceMap', 'prehide', 'requestModule', 'ui.bootstrap',
    'ngSanitize', 'ui-notification', 'cemeteryShowScheme', 'squareMap', 'oivMap', 'justPlaces', 'preloader',
    'militaryRecords', 'stelas', 'invPlaceMap', 'cemeteryQuarters', 'oi.select']);

app.config(function (NotificationProvider) {
    NotificationProvider.setOptions({
        delay: 5000,
        startTop: 20,
        startRight: 10,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'right',
        positionY: 'bottom'
    });
});

app.controller('defaultController', function ($scope, $http, Notification, $q) {
    $http.get(baseUrl + 'Access/Allowed?resource=' + resources.placeEditCultureLegacy(globalPlaceId)).then(function (r) {
        $scope.placeEditCultureLegacyAllowed = r.data;
    });

    $http.get(globalPlaceCoordinatesUrl + '?placeId=' + globalPlaceId)
        .success(function (data) {
            $scope.gpsResult = true;
            $scope.gps = data;
        })
        .error(function (err) {
            $scope.gpsResult = false;
        });
    $scope.getGPSForPlace = function (placeId) {
        $http.get(globalPlaceCoordinatesUrl + '?placeId=' + placeId)
            .success(function (data) {
                $scope.gpsResultForPlace = true;
                $scope.gpsForplace = data;
            })
            .error(function (err) {
                $scope.gpsResultForPlace = false;
            });
    };

    $scope.placeId = globalPlaceId;
    $scope.quarter = globalQuarterCaption;
    $scope.cemeteryId = globalCemeteryId;
    $scope.placesFilter = { placeId: globalPlaceId };

    if (typeof globalQuarterCaptionFromContour !== 'undefined')
        $scope.quarterCaptionFromContour = globalQuarterCaptionFromContour;

    // файлы
    $scope.files = { pagination: { page: 1 } };
    $scope.getFiles = function () {
        var params = {
            page: $scope.files.pagination.page,
        };
        $http.get(globalPlaceFileApi, { params: params }).success(function (data) {

            $scope.files.list = data.list;
            $scope.files.pagination = data.pagination;
        });
    };

    $scope.change = function (t) {
        hillTab = t;
        ViewBag.HillTab = t;
    }
    $scope.checkPayment = function () {
        $http.get(globalCheckPaymentApiUrl).success(function () {
            window.location.reload();
        }).error(function (text, code) {
            console.log(code);
            if (code == 403) {
                Notification.error('Платёж ещё не поступил');
            } else {
                Notification.error('Ошибка при проверке платежа');
            }
        });
    };

    $scope.hide = function () {
        const req = {
            placeId: globalPlaceId,
            hidePlace: true
        };

        $http.post(globalHideApiUrl, req).then(function () {
            window.location.reload()
        });
    }

    $scope.unhide = function () {
        const req = {
            placeId: globalPlaceId,
            hidePlace: false
        };

        $http.post(globalHideApiUrl, req).then(function () {
            window.location.reload()
        });
    }

    $scope.$watch('nmsForeignLanguage', (newValue, oldValue) => {
        if ($scope.nmsForeignLanguage === undefined) return;
        if (newValue == oldValue) return;
        const req = {
            placeId: globalPlaceId,
            hidePlace: $scope.nmsForeignLanguage
        };

        $scope.nmsForeignLanguagePromise = $http.post(globalNmsForeignLanguageApiUrl, req).then(function () {
        }).finally(function () {
            $scope.nmsForeignLanguagePromise = undefined;
        });
    });

    $scope.nmsForeignLanguage = globalNmsForeignLanguage == 'True' ? true : false;

    $http.get(baseUrl + 'PlaceVerificationsApi/GetVerification?placeId=' + globalPlaceId).then(function (r) {
        $scope.verification = r.data;
    });

    $http.get(baseUrl + 'Access/Allowed?resource=' + resources.placeVerificationUpdate(globalPlaceId)).then(function (r) {
        $scope.placeVerificationUpdateAllowed = r.data;
    });

    $scope.updateVerification = function () {
        $scope.verificationUpdatePromise = $http.post(baseUrl + resources.placeVerificationUpdate(globalPlaceId), $scope.verificationUpdateModel).then(function () {
            $scope.verificationUpdatePromise = new Promise(function () { });
            window.location.reload();
        });
    };

    $scope.changeQuarter = {
        show: false,
        param: {
            quarter: '',
            placeId: 0
        },
        change: function () {
            $scope.changeQuarter.promise = $http.post(globalChangeQuarterApiUrl, this.param)
                .then(r => window.location.reload())
                .catch(r => alert(r.status === 500 ? 'Техническая ошибка на сервере' : 'Не хватает прав или данных'))
                .finally(() => $scope.changeQuarter.promise = undefined);
        }
    };

});