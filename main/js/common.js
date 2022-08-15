
$.fn.enterKey = function (fnc) {
	return this.each(function () {
		$(this).keypress(function (ev) {
			var keycode = (ev.keyCode ? ev.keyCode : ev.which);
			if (keycode == '13') {
				fnc.call(this, ev);
			}
		})
	})
}

$(function () {

	$(window).enterKey(function (e) {
		e.preventDefault();
		alert('Для перехода между полями ввода используйте TAB');
	});

	$('[data-toggle="tooltip"]').tooltip();

	$('input[type=file]').bootstrapFileInput();

	$('.mask-date').inputmask('99.99.9999');

	$('.activate-plugin').each(function() {
		if ($(this).data('plugin') == 'autocomplete') {
			var url = $(this).data('url');
			var $input = $(this).prev();
			$.ajax({
				method:'get',
				url: url,
				success: function (data) {
					$input.autocomplete({ source: data.list });
				}
			});
		}
		if ($(this).data('plugin') == 'street-autocomplete') {
			var $object = $(this);
			var url = $object.data('url');
			$object.keyup(function () {
				var value = $(this).val();
				if (value.length > 2) {
					$.ajax({
						url: url + '?q=' + value,
						method: 'post',
						success: function (data) {
							$object.autocomplete({ source: data });
						}
					});
				}
			});
		}
	});


	$.datepicker.regional['ru'] = {
		closeText: 'Закрыть',
		prevText: '&#x3c;Пред',
		nextText: 'След&#x3e;',
		currentText: 'Сегодня',
		monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
		'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
		monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
		'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
		dayNames: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
		dayNamesShort: ['вск', 'пнд', 'втр', 'срд', 'чтв', 'птн', 'сбт'],
		dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
		dateFormat: 'dd.mm.yy',
		firstDay: 1,
		isRTL: false
	};
	$.datepicker.setDefaults($.datepicker.regional['ru']);



});

function ajaxBefore() {
	showBg();
}
function ajaxAfter() {
	hideBg();
}

function showBg() {
	$('#bg').fadeIn(50, function () {
		$('#spin').fadeIn(500);
	})
}
function hideBg() {
	$('#bg').stop();
	$('#spin').stop();
	$('#spin').fadeOut(200, function () {
		$('#bg').fadeOut(50)
	});
}

function addParameter(input, name, value) {
	if (input.indexOf('?') != -1)
		return input += '&' + name + '=' + value;
	else
		return input += '?' + name + '=' + value;
}

// сортировка по набору полей, выше поднимается если нет значения
function sort(data, fieldSet) {
    data = data.sort(function (a, b) {
        for (i = 0; i < fieldSet.length; i++) {
            var field = fieldSet[i];
            if (a[field] === b[field]) {
                continue;
            } else {
                if (a[field] === undefined && b[field] !== undefined)
                    return -1;
                if (b[field] === undefined && a[field] !== undefined)
                    return 1;
                return a[field] - b[field];
            }
        }
    });
    return data;
}

function rollup(data, fieldSet, valuesFieldSet) {
    var initialFieldSet = fieldSet.slice(0);
    function run(data, fieldSet, fieldSetLeaved, valuesFieldSet) {

        var auxHash = {};
        var newData = [];

        data.forEach(function (item) {
            var keyObject = {};
            fieldSet.forEach(function (fieldName) {
                keyObject[fieldName] = item[fieldName];
            });
            var key = JSON.stringify(keyObject);
            if (auxHash[key] === undefined)
                auxHash[key] = 1;
            else
                auxHash[key]++;
        });
        for (var key in auxHash) {
            key = JSON.parse(key);

            // получаем срез массива с такими же первыми полями как у хеша
            var dataChunk = data.filter(function (dataItem) {
                var condition = true;
                fieldSet.forEach(function (fieldName) {
                    if (dataItem[fieldName] !== key[fieldName])
                        condition = false;
                });
                return condition;
            });

            var newRow = {};
            fieldSet.forEach(function (fieldName) {
                newRow[fieldName] = key[fieldName];
            });
            valuesFieldSet.forEach(function (valueFieldName) {
                newRow[valueFieldName] = 0;
            });
            dataChunk.forEach(function (dataItem) {
                valuesFieldSet.forEach(function (valueFieldName) {
                    newRow[valueFieldName] += dataItem[valueFieldName];
                });
            });
            newData.push(newRow);
        }
        return newData;

    }

    var fieldSetLeaved = [];
    var newData = [];
    while (fieldSet.length !== 1) {
        fieldSetLeaved.push(fieldSet.pop());
        newData = newData.concat(run(data, fieldSet, fieldSetLeaved, valuesFieldSet));

    }
    data = data.concat(newData);
    data = sort(data, initialFieldSet);
    return data;
}


$(function(){
    $(".dropdown-menu > li > a.trigger").on("click",function(e){
        var current=$(this).next();
        var grandparent=$(this).parent().parent();
        if($(this).hasClass('left-caret')||$(this).hasClass('right-caret'))
            $(this).toggleClass('right-caret left-caret');
        grandparent.find('.left-caret').not(this).toggleClass('right-caret left-caret');
        grandparent.find(".sub-menu:visible").not(current).hide();
        current.toggle();
        e.stopPropagation();
    });
    $(".dropdown-menu > li > a:not(.trigger)").on("click",function(){
        var root=$(this).closest('.dropdown');
        root.find('.left-caret').toggleClass('right-caret left-caret');
        root.find('.sub-menu:visible').hide();
    });
});

var urls = {
    anyFile: function(id){
        return baseUrl + 'AnyFile/Index/' + id;
    },
    application: function(id){
        return baseUrl + 'ApplicationDetails/Index/' + id;
    },
    archiveRecord: function(id){
        return baseUrl + 'ArchiveRecordDetails/Index/' + id;
    },
    interment: function(id){
        return baseUrl + 'IntermentDetails/Index/' + id;
    },
    place: function (id) {
        return baseUrl + 'NewPlace-' + id;
    },
    supportTicket: function(id){
        return baseUrl + 'Support/TicketDetails/Index/' + id;
    },
    user: function(id){
        return baseUrl + 'User/Details/' + id;
    },
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var resources = {
    supportTicketComment: function(ticketId){
        return 'support/ticket/' + ticketId + '/comment';
    },
    supportTicketStatusList: function(ticketId){
        return 'support/ticket/' + ticketId + '/status';
    },
    placesDraw: function () {
        return 'places/draw';
    },
    placeEditCultureLegacy: function(placeId){
        return 'place/' + placeId + '/edit/culturelegacy';
    },
    reportsApplicationsNmsExtended: function(){
        return 'reports/applications/nms/extended';
    },
    applicationDelete: function(applicationId){
        return 'application/' + applicationId + '/delete';
    },
    applicationScanReplace: function(applicationId){
        return 'application/' + applicationId + '/scan/replace';
    },
    intermentEditHillChange: function(intermentId){
        return 'interment/' + intermentId + '/edit/hill/change';
    },
    intermentEditPlaceChange: function(intermentId){
        return 'interment/' + intermentId + '/edit/place/change';
    },
    intermentDelete: function(intermentId){
        return 'interment/' + intermentId + '/delete';
    },
    placeVerificationGroupCreate: function (cemeteryId) {
        return 'place/verification/group/create/' + cemeteryId;
    },
    placeVerificationUpdate: function (placeId) {
        return 'place/verification/update/' + placeId;
    },
};

function commonCatch(scope) {
    return function (r) {
        if (r.status === 400) {
            scope.errors = r.data;
            alert('Не все поля заполнены или заполнены неверно');
        } else if (r.status === 403) {
            alert('Нет прав на это действие, или время сессии закончилось');
        } else {
            alert('На сервере произошла ошибка. Исправление займёт какое-то время. Попробуйте позже.');
        }
    };
}

function httpPromise($http, url) {
    return new Promise(function (resolve, reject) {
        $http.get(baseUrl + url).then(function(r){
            resolve(r.data);
        }).catch(reject);
    })
}

function wrapOrRequest($http, url, data) {
    return new Promise(function (resolve, reject) {
        if(!_.isEmpty(data)){
            resolve(data);
        }else{
            httpPromise($http, url).then(resolve).catch(reject);
        }
    })
}

function registerCommonServices(app) {
    app.service('dictsService', ['$http', '$q', function($http, $q){
        var storedDicts = {};
        this.get = function(){
            return $q(function(resolve, reject){
                var dictsPromise = wrapOrRequest($http, 'RitualApi/Dicts', storedDicts);
                dictsPromise.catch(reject);
                dictsPromise.then(function (dicts) {
                    storedDicts = dicts;
                    resolve(dicts);
                });
            });
        };
        this.getPersonal = function(){
            return $q(function(resolve, reject){
                var dictsPromise = httpPromise($http, 'RitualApi/DictsPersonal');
                dictsPromise.catch(reject);
                dictsPromise.then(function (dicts) {
                    resolve(dicts);
                });
            });
        };
    }]);
}