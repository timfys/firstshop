(function() {
    angular.module('requestModule', [])
        .config(function ($httpProvider) {
        $httpProvider.interceptors.push(function ($q) {
            return {
                'request': function (config) {
                    ajaxBefore();
                    return config;
                },
                'response': function (response) {
                    ajaxAfter();
                    return response;
                },
                'responseError': function (response) {
                    if (response.status === 0) {

                    } else {
                        console.log('При запросе произошла ошибка на сервере');
                    }
                    ajaxAfter();
                    return $q.reject(response);
                },
            };
        });
    });

    angular.module('ritualAngular', ['angularFileUpload']).directive('fileUpload', [
        'FileUploader', function(FileUploader) {
            return {
                restrict: 'E',
                replace: true,
                link: function($scope, element, attrs) {

                    $scope.itemsCount = parseInt($scope.itemsCount) || 0;

                    $scope.uploader = new FileUploader({
                        url: $scope.url
                    });

                    $scope.uploader.queue = [];

                    $scope.uploader.onAfterAddingFile = function () {
                        console.log('onAfterAddingFile');
                        $scope.errors = {};
                        $scope.showMessage = false;
                    };
                    $scope.uploader.onSuccessItem = function (file, response) {
                        if (response.errors) {
                            $scope.errors = response.errors;
                            $scope.uploader.queue.pop();
                        }
                        //success
                        else
                        {
                            $scope.itemsCount++;
                            $scope.errors = {};
                            $scope.showMessage = true;
                        }
                    };

                    $scope.uploader.onErrorItem = function (item, response, status, headers) {
                        $scope.uploader.queue.pop();
                        console.info('error', item, response, status, headers);
                    };
                },
                scope: {
                    url: "@",
                    itemsCount: "=",
                    message: "@",
                },
                template:
                    '<div>' +
                        '<div class="alert alert-success" ng-show="itemsCount && showMessage">{{message}}</div>' +
                        '<input class="btn btn-default" ng-if="uploader" type="file" uploader="uploader" multiple nv-file-select title="Выберите файл"/>' +
                        '<br/>' +
                        '<br/>' +
                        '<div class="alert alert-danger" ng-show="errors.length">' +
                        '<p ng-repeat="row in errors">{{row.error}}</p>' +
                        '</div>' +
                        '<div class="btn btn-success" ng-show="uploader.queue.length == itemsCount+1" ng-click="uploader.queue[itemsCount].upload()" ' +
                        ' ng-disabled="uploader.queue[itemsCount].isReady || uploader.queue[itemsCount].isUploading || uploader.queue[itemsCount].isSuccess">Загрузить</div>' +
                        '<div class="progress" ng-show="uploader.queue[itemsCount].isUploading">' +
                        ' <div class="progress-bar" role="progressbar" ng-style="{width: (100 - uploader.queue[itemsCount].progress) + \'%\' }"></div>' +
                        '</div>' +
                        '<div>'
            }
        }
    ]);
    
    var module = angular.module('ritual', ['ui.bootstrap', 'ngMask']);

    module.directive("ngUploadChange", function () {
        return {
            scope: {
                ngUploadChange: "&"
            },
            link: function ($scope, $element, $attrs) {
                $element.on("change",
                    function(event) {
                        $scope.$apply(function() {
                            $scope.ngUploadChange({ $event: event });
                        });
                    });
                $scope.$on("$destroy", function () {
                    $element.off();
                });
            }
        }
    });
    
    module.directive('validNumber', function () {
        return {
            require: '?ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {
                if (!ngModelCtrl) {
                    return;
                }

                ngModelCtrl.$parsers.push(function (val) {
                    if (angular.isUndefined(val)) {
                        var val = '';
                    }
                    var mask = new RegExp(/[^0-9]/g);

                    if (!angular.isUndefined(attrs.validNumber) && !isNaN(attrs.validNumber)) {
                        var flags = Number(attrs.validNumber);

                        if (flags == 3) mask = new RegExp(/[^-0-9\.]/g);
                        else if (flags == 2) mask = new RegExp(/[^-0-9]/g);
                        else if (flags == 1) mask = new RegExp(/[^0-9\.]/g);
                    }

                    var clean = val.replace(mask, '');
                    var negativeCheck = clean.split('-');
                    var decimalCheck = clean.split('.');
                    if (!angular.isUndefined(negativeCheck[1])) {
                        negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                        clean = negativeCheck[0] + '-' + negativeCheck[1];
                        if (negativeCheck[0].length > 0) {
                            clean = negativeCheck[0];
                        }

                    }

                    if (!angular.isUndefined(decimalCheck[1])) {
                        decimalCheck[1] = decimalCheck[1].slice(0, attrs.validNumber);
                        clean = decimalCheck[0] + '.' + decimalCheck[1];
                    }

                    if (val !== clean) {
                        ngModelCtrl.$setViewValue(clean);
                        ngModelCtrl.$render();
                    }
                    return clean;
                });

                element.bind('keypress', function (event) {
                    if (event.keyCode === 32) {
                        event.preventDefault();
                    }
                });
            }
        };
    });
    
    module.directive('ritualDatepicker', function() {

		var template = '<p class="input-group">' +
			'<input name="{{name}}" type="text" class="form-control" ng-model="ngModel" ng-disabled="ngDisabled" mask="39.19.2999"/>' +
			'<input style="display: inline; visibility: hidden; width: 0; height: 0; padding: 0; border: none" type="text" class="form-control" uib-datepicker-popup="dd.MM.yyyy" ng-model="ngModelDate" ng-disabled="ngDisabled" is-open="opened" show-button-bar="false" />' +
			'<span class="input-group-btn"> ' +
			'<button ng-disabled="ngDisabled" type="button" class="btn btn-default" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button>' +
			'</span>' +
			'</p>';

		return {
		    controller: ['$scope', '$http', function ($scope, $http) {
		        $scope.$watch("ngModel", function (newVal) {
                    if (!newVal) return;
                    const parts = newVal.split('.');
                    $scope.ngModelDate = new Date(parts[2], parts[1] - 1, parts[0])
                });
		        
		        $scope.$watch("ngModelDate", function (newVal) {
		            if (!newVal) return;
		            if ($scope.opened)
		                $scope.ngModel = $scope.ngModelDate.toLocaleDateString("ru-RU")
                });
            }],
            restrict: 'E',
			template: template,
			link: function($scope) {

				$scope.open = function($event) {
					$event.preventDefault();
					$event.stopPropagation();

					$scope.opened = true;
				};

			},
			scope: {
			    ngModelDate: '=?',
                ngModel: '=',
                ngDisabled: '=',
				name: '@'
			}
		}
    });

    module.directive('burialTypes', function () {
        return {
            controller: ['$scope', '$http', function ($scope, $http) {
                var savedTypes;
                $scope.showList = true;

                $http.get(baseUrl + 'IntermentsApi/IntermentTypes').then(function (r) {
                    savedTypes = r.data;
                    // если кладбище уже есть, то профильтуем типы
                    if ($scope.cemetery != null) filterTypes();
                });

                $scope.setType = function (type) {
                    $scope.showList = !$scope.showList;

                    if ($scope.selectedType != null && $scope.selectedType.id == type.id) return;

                    $scope.selectedType = type;
                    $scope.selectedTypeId = type.id;
                };

                function filterTypes() {
                    $scope.types = _.clone(savedTypes);
                    // первичное захоронение
                    if ($scope.onlyFirst != null && $scope.onlyFirst == "true") $scope.types = $scope.types.filter(function (type) { return type.isFamily == false; });
                    // не первичное захоронение
                    if ($scope.onlyFamily != null && $scope.onlyFamily == "true") $scope.types = $scope.types.filter(function (type) { return type.isFamily == true; });
                    // фильтрация типов по кладбищу
                    $scope.types = $scope.types.filter(function (type) { return type.isCemeteryOpen == $scope.cemetery.isOpen && type.isCemeteryTinao == $scope.cemetery.isTinao; });
                    if ($scope.allowedIntermentTypeIds != null) $scope.types = $scope.types.filter(function (type) { return $scope.allowedIntermentTypeIds.indexOf(type.id) > -1; });
                }

                $scope.$watch('types', function (newValue, oldValue) {
                    // первый никчемный прогон
                    if (newValue == null && oldValue == null) return;
                    // когда снаружи выставили ID
                    if ($scope.selectedTypeId != null && $scope.selectedType == null && $scope.types != null) 
                        setTimeout(function () {
                            $scope.selectedType = $scope.types.filter(function (x) { return x.id == $scope.selectedTypeId; })[0];
                            $scope.$apply();
                        }, 0);
                    
                    // нужно прочистить текущее значение
                    if ($scope.selectedType != null && newValue != null)
                        if (newValue.filter(function (x) { return x.id == $scope.selectedType.id; })[0] == null) {
                            $scope.selectedType = null;
                            $scope.selectedTypeId = null;
                        }
                });


                $scope.$watch('selectedTypeId', function () {
                    $scope.showList = false;
                    // когда снаружи выставили ID
                    if ($scope.selectedTypeId != null && $scope.selectedType == null && $scope.types != null) {
                        $scope.selectedType = $scope.types.filter(function (x) { return x.id == $scope.selectedTypeId; })[0];
                    }
                });

                $scope.$watch('cemetery', function (newValue, oldValue) {
                    // первый никчемный прогон
                    if (newValue == null && oldValue == null) return;
                    // если сносят кладбище, чистим тип
                    if (newValue == null) {
                        $scope.selectedType = null;
                        $scope.selectedTypeId = null;
                    }
                    // если ещё не прилетели типы
                    if (savedTypes == null) return;
                    filterTypes();
                });
            }],
            restrict: 'E',
            template: "<div>\r\n    <ul class=\"list-group\">\r\n        <li style=\"cursor:pointer\" class=\"list-group-item selectable-div\" ng-show=\"selectedType === undefined || selectedType.id === intermentType.id || showList === true\"\r\n            ng-class=\"{selected: selectedType.id === intermentType.id}\" ng-repeat=\"intermentType in types\" ng-click=\"setType(intermentType)\">\r\n            <strong>{{intermentType.name}}</strong> (\r\n            <small>{{intermentType.explanation}}</small>)\r\n        </li>\r\n    </ul>\r\n</div>",
            replace: true,
            scope: {
                url: '@',
                onlyFirst: '@',
                onlyFamily: '@',
                cemetery: '=',
                selectedType: "=?",
                allowedIntermentTypeIds: "=?",
                selectedTypeId: "=?"
            }
        };
    });
})();