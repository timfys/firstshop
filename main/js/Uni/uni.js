// god save me
var QueryString = function () {
    // This function is anonymous, is executed immediately and 
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();

var app = angular.module('defaultApp', ['ngMask', 'ritual', 'oi.select', 'minireport', 'decimalInput', 'excelButton',
    'fullExcelButton', 'ui-notification', 'ui.bootstrap', 'ngStorage', 'placeColorSelector', 'specControl', 'preloader',
    'helpersExcelButton']);
registerCommonServices(app);

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

app.controller('defaultController', ['$q', '$http', '$scope', 'Notification', '$sessionStorage', 'dictsService', function ($q, $http, $scope, Notification, $sessionStorage, dictsService) {
    // эти 4 массива передаются с бекенда через переменную
    $scope.distDict1 = distDict1;
    $scope.distDict2 = distDict2;
    $scope.distDict3 = distDict3;
    $scope.distDict4 = distDict4;
    $scope.retraces = retraces;
    $scope.dictionaries = {};
    $scope.form = {};
    $scope.filter = {};
    $scope.pagination = { page: 1 };

    // получение участков
    $scope.get = function (name) {
        var url = getPlacesApiUrl + '&page=' + $scope.pagination.page;
        $scope.placesPromise = $http.post(url, $scope.filter).success(function (data) {
            $scope.list = data.list;
            $scope.pagination = data.pagination;
        }).error(function () {
            Notification.error('Не удалось загрузить участки');
        });
    };

    if (load)
        $scope.get();

    $scope.$watch('filter.specs', function () {
        if ($scope.filter.specs !== undefined)
            $scope.get();
    }, true);

    // ключ для страницы, по которому её данные будут храниться в sessionStorage
    var cacheKey = "placesSearchForm" + window.location.href;

    // устанавливает в кеш данные текущей страницы
    function setPlaceSearchForm() {
        $sessionStorage[cacheKey] = {
            filter: $scope.filter,
            group: $scope.group,
            pagination: $scope.pagination,
            dictionaries: $scope.dictionaries,
        };
    }
    // получает данные сохраненный в кеше данной страницей
    var cachedData = $sessionStorage[cacheKey];

    if (cachedData !== undefined) {
        // если удалось извлечь данные из кеша, устанавливает фильтр и пагинацию
        $scope.pagination = cachedData.pagination;
        $scope.filter = cachedData.filter;
        $scope.group = cachedData.group;
    }


    var dictPromise;
    if (cachedData !== undefined) {
        dictPromise = $q.when(cachedData.dictionaries);
    }

    // если не удалось извлечь данные из кеша, то делаем промис, обращающийся на бекенд
    if (cachedData === undefined && useForm === true) {
        dictPromise = $q(function (resolve, reject) {
            dictsService.get().then(function (dicts) {
                // массив доступных для выбора элементов в форме
                dicts.toros.push({ id: tinaoId, name: 'ТиНАО' });
                dicts.intermentTypesWithNo = JSON.parse(JSON.stringify(dicts.intermentTypes));
                dicts.intermentTypesWithNo.push({ id: -1, name: 'Не установлено' });
                resolve({
                    earthes: dicts.earthes,
                    types: dicts.types,
                    statuses: dicts.statuses,
                    delay: dicts.delay,
                    toros: dicts.toros,
                    conditions: dicts.conditions,
                    ziConditions: dicts.ziConditions,
                    intermentTypes: dicts.intermentTypes,
                    intermentTypeRealized: dicts.intermentTypeRealized,
                    buildingTypes: dicts.buildingTypes,
                    cemeteries: dicts.cemeteries,
                    areas: dicts.areas,
                    lastname: dicts.lastname,
                    firstname: dicts.firstname,
                    middlename: dicts.middlename,
                    districts: dicts.districts,
                    colors: dicts.colors,
                    intermentTypesWithNo: dicts.intermentTypesWithNo,
                });

            }).catch(function () {
                Notification.error('Не удалось загрузить данные для формы');
            });
        });
    }

    // резолвим промис на словари
    if (dictPromise !== undefined)
        dictPromise.then(function (data) {
            $scope.dictionaries = data;
            if (globalGroups !== undefined) {
                $scope.dictionaries.groups = globalGroups;

                $scope.form.groups = _.filter($scope.dictionaries.groups, function (item) {
                    return item.id == 6 || item.id == 7 || item.id == 8;
                });
            }
            $scope.form = _.clone(data);
            $scope.form.haveInterments = [
                { id: 0, name: '' },
                { id: 1, name: 'Не действующий (Захоронение произведено)' },
                { id: 2, name: 'Действующий (Захоронение не произведено)' }
            ];
            $scope.form.brotherOption = [
                { id: 0, name: 'индивидуальное' },
                { id: 1, name: 'братское' },
            ];
            $scope.form.auctionDay = [
                { id: 1, name: 'менее 30' },
                { id: 2, name: 'более 30' },
            ];
            $scope.filterByTypes();
        });

    var groupedPromise = $http.get(groupByCemeteryApiLink)
        .success(function (data) {
            $scope.groupByCemeteries = data;
            map();
        }).error(function () {
            Notification.error('Не удалось загрузить данные');
        });

    // когда словари и группировка по кладбищам устаканились можно отфильтровать кладбища и ТОРО
    $q.all([dictPromise, groupedPromise]).then(function () {
        // все ID кладбищ, которые присутвтсуют на этой странице
        var groupedIds = $scope.groupByCemeteries.map(function (item) {
            return item.id;
        });

        // кладбища
        $scope.dictionaries.cemeteries = _.filter($scope.dictionaries.cemeteries, function (item) {
            return _.includes(groupedIds, item.id);
        });
        var toroIds = $scope.dictionaries.cemeteries.map(function (item) {
            return item.toroId;
        });
        toroIds = _.uniq(toroIds);

        $scope.form.toros = _.filter($scope.form.toros, function (item) {
            if (item.id == tinaoId)
                return true;
            return _.includes(toroIds, item.id);
        });

        if (_.isEmpty($scope.form.statuses)) {

        }
        //
        if (_.isEmpty($scope.filter.statuses)) {
            if (!_.isEmpty(QueryString.statusId)) {
                $scope.filter.statuses = [parseInt(QueryString.statusId)];
                $scope.get();
            }
        }

        $scope.applyCemeteryFilter();
    });

    // если выставлены types с сервера, то убираем из формы лишние типы
    $scope.filterByTypes = function () {
        if (!_.isEmpty(types)) {
            $scope.filter.types = types;
            $scope.form.types = $scope.form.types.filter(function (item) {
                return _.includes(types, item.id);
            });
        }
    };

    $scope.applyCemeteryFilter = function () {
        if (_.isEmpty($scope.dictionaries))
            return;

        if (_.isEmpty($scope.filter.toros)) {
            $scope.form.cemeteries = _.clone($scope.dictionaries.cemeteries);
            return;
        }

        // определяем есть ли в выбранных торо ТиНАО
        var haveTinao = _.includes($scope.filter.toros, tinaoId);

        var toroIds = _.clone($scope.filter.toros);

        // удаляем из списка ID торо 999 (ТиНАО)
        toroIds = _.filter(toroIds, function (item) {
            return item != tinaoId;
        });

        if (haveTinao)
            $scope.form.cemeteries = $scope.form.cemeteries.filter(function (item) {
                return item.tinao === true;
            });

        // если торо ещё оставлись то и по ним фильтруем
        if (!_.isEmpty(toroIds))
            $scope.form.cemeteries = $scope.dictionaries.cemeteries.filter(function (item) {
                return _.includes(toroIds, item.toroId);
                ;
            });
    };

    $scope.$watch('filter.toros', function () {
        $scope.applyCemeteryFilter();
    });

    $scope.$watch('form.cemeteries', function () {
        // фильтруем выбранные кладбища, удаляем непопадающие в отфильтрованный список
        if (!_.isEmpty($scope.filter.cemeteries)) {
            var cemeteryIds = $scope.form.cemeteries.map(function (item) {
                return item.id;
            });
            $scope.filter.cemeteries = _.intersection(cemeteryIds, $scope.filter.cemeteries);
        }
    });

    $scope.$watch('filter.types', function () {
        if (_.isEmpty($scope.dictionaries))
            return;

        if ($scope.dictionaries !== undefined) {
            if ($scope.dictionaries.statuses !== undefined) {
                $scope.form.statuses = $scope.dictionaries.statuses.slice();
                if (!_.isEmpty($scope.filter.types)) {
                    $scope.form.statuses = $scope.form.statuses.filter(function (item) {
                        return _.includes($scope.filter.types, item.typeId);
                    });
                }
            }
        }
    });
    
    $scope.$watch('form.statuses', function () {
        if (!_.isEmpty($scope.filter.statuses)) {
            var ids = $scope.form.statuses.map(function (item) {
                return item.id;
            });
            $scope.filter.statuses = _.intersection(ids, $scope.filter.statuses);
        }
    });

    $scope.navigateTo = function (url, newTab) {
        if (newTab) {
            var win = window.open(url, '_blank');
            win.focus();
        } else {
            showBg();
            // перед уходом со страницы, сохраняет в кеш её состояние
            setPlaceSearchForm();
            window.location = url;
        }
    };

    $scope.loadGrouped = function () {
        $http.get(groupApiLink)
            .success(function (data) {
                $scope.grouped = data;
            }).error(function () {
                $scope.statisticError = 'Не удалось загрузить быструю статистику';
                Notification.error('Не удалось загрузить быструю статистику');
            });
    };

    if (useHills) {
        $http.get(hillsApiLink)
            .success(function (data) {
                $scope.hillsInfo = data;
            }).error(function () {
                Notification.error('Не удалось загрузить статистику по могилам, размерам и состояниям');
            });
    }

    if (useSearchRealizations) {
        $scope.realizationsDict = realizationsDict;
        $http.get(searchRealizationsApiUrl)
            .success(function (data) {
                $scope.realizationsGrouped = data;
            }).error(function () {
                Notification.error('Не удалось загрузить статистику по типам реализаций');
            });
        $scope.removeRealization = function () {
            $scope.filter.realizationId = undefined;
            $scope.get();
        };
        $scope.setRealization = function (realizationId) {
            $scope.filter.realizationId = realizationId;
            $scope.get();
        };
    }


    $scope.setGroupAndStatus = function (group, status) {

        if ($scope.filter.groupId === group.id) {
            if ($scope.filter.statuses === undefined) {
                $scope.filter.statuses = [status.id];
            } else {

                if (_.includes($scope.filter.statuses, status.id)) {
                    _.remove($scope.filter.statuses, function (item) { return item == status.id; });
                } else {
                    $scope.filter.statuses.push(status.id);
                }
            }
        } else {
            $scope.filter.statuses = [status.id];
            $scope.filter.groupId = group.id;
        }

        if ($scope.filter.statuses.length == 0) {
            $scope.filter.groupId = undefined;
        }

        $scope.get();
    };

    $scope.$watch('filter.brotherOption', function () {
        if ($scope.filter === undefined)
            return;
        if ($scope.filter.brotherOption === undefined)
            return;

        if ($scope.filter.brotherOption == 0) {
            $scope.filter.militaryCountFrom = 1;
            $scope.filter.militaryCountTo = 1;
        }
        if ($scope.filter.brotherOption == 1) {
            $scope.filter.militaryCountFrom = 2;
            $scope.filter.militaryCountTo = undefined;
        }
    });

    $scope.removeGroupAndStatus = function () {
        $scope.filter.statuses = [];
        $scope.filter.groupId = undefined;
        $scope.group = undefined;
        $scope.status = undefined;
        $scope.get();
    };

    $scope.setSort = function (fieldName) {
        if ($scope.filter.sort == fieldName + '-asc') {
            $scope.filter.sort = fieldName + '-desc';
        }
        else {
            $scope.filter.sort = fieldName + '-asc';
        }
        $scope.get();
    };

    $scope.setRetrace = function (id) {

        if ($scope.filter.retraces === undefined) {
            $scope.filter.retraces = [id];
        } else {
            if (_.includes($scope.filter.retraces, id)) {
                _.remove($scope.filter.retraces, function (item) { return item == id; });
            } else {
                $scope.filter.retraces.push(id);
            }
        }

        $scope.get();
    };

    $scope.retracesDict = {};
    $scope.getCountByRetraces = function (id) {
        $http.post(countPlacesApiUrl, { retraces: [id] }).success(function (data) {
            $scope.retracesDict[id] = data;
        });
    };

    $scope.selectGroupOfSpesc = function (specNames) {
        var specs = specNames.split(',').map(function (item) { return item.trim(); });
        if ($scope.filter.specs !== undefined && $scope.filter.specs.length > 0 && _.includes($scope.filter.specs, specs[0]))
            $scope.filter.specs = [];
        else
            $scope.filter.specs = specs;
    }

    $scope.setGroup = function (group) {
        $scope.filter.statuses = group.statuses.map(function (item) { return item.id });
        $scope.filter.groupId = group.id;
        $scope.get();
    }
    $scope.goReport = function (param) {
        alert("Выгрузка данных началась");
        $http.post(baseUrl + 'XApi/Report', param = { param}).success(function (data) {
            $scope.active = false;
            window.location = data;
        })
            .error(function () {
                alert('Произошла ошибка при выгрузке в таблицу');
                $scope.active = false;
            });;
    };

    // карта
    function map() {
        if (window.gcapi !== undefined) {

            gcapi.ready = function () {
                gcapi.MapContainer = "map-container";
                gcapi.Zoom = 2;
                gcapi.Map = 37.619293;
                gcapi.Center.x = 37.619293;
                gcapi.Center.y = 55.752416;
                gcapi.OnMapLoad = function () {
                    $scope.groupByCemeteries.forEach(function (item) {
                        var cemetery = $scope.dictionaries.cemeteries.filter(function (x) { return x.id == item.id; })[0];

                        gcapi.AddPoint(
                            {
                                idlayer: 'rit_objects',
                                idpoint: cemetery.id,
                                symbolurl: MapServiceURL('/JS_SCRIPT_LIB/images/image_map_marker_blue.png'),
                                symbolwidth: 24,
                                symbolheight: 24,
                                x: cemetery.lng,
                                y: cemetery.lat,
                                txt: cemetery.name + ' ' + item.count,
                                text_x_offset: 10,
                                text_y_offset: 0,
                                fontcolor: '#000000',
                                fontbold: 1,
                                fontname: 'Segoe UI',
                                fontsize: 11
                            }
                        );
                    });
                    $scope.mapLoadFinished = true;
                    $scope.$apply();
                    document.getElementById('map-container').style.width = "100%";
                    gcapi.Map.resize();


                };
            };
        }
    }
}]);