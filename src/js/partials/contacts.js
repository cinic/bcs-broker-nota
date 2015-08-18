var markers = [];
var routing = false;
var contactMap;

function hoverMarker(num)
{
    var marker = markers[num];
    var placemark = marker.placemark;
    placemark.options.set('iconContentLayout', ymaps.templateLayoutFactory.createClass('<span class="marker active">'+num+'</span>'));
    $('.point[data-point='+num+'] .marker').addClass('hovered');
}
function blurMarker(num)
{
    var marker = markers[num];
    var placemark = marker.placemark;
    if (!marker.active)
        placemark.options.set('iconContentLayout', ymaps.templateLayoutFactory.createClass('<span class="marker">'+num+'</span>'));
    $('.point[data-point='+num+'] .marker').removeClass('hovered');
}

function openRoute()
{
    closeAllPointDetails();
    //$('.map-route-link').addClass('active');
    $('.route').show();
    bindTogglebox();
    routing = true;
}

function closeRoute()
{
    removeRoute();
    //$('.map-route-link').removeClass('active');
    $('.route').hide();
    routing = false;
}
function clearRoutes()
{
    $('.route .route-points input').val('');
}
function setRoutePoint(coord, name, n)
{
    if (n == 1)
    {
        $('#pointA').val(name);
        $('#pointA-coord').val(coord);
    }
    else
    {
        $('#pointB').val(name);
        $('#pointB-coord').val(coord);
    }

    if ($('#pointA-coord').val().length && $('#pointB-coord').val().length)
    {
        setRoute();
    }
}
var multiRoute=false;
function removeRoute() {
    if (multiRoute) {
        contactMap.geoObjects.remove(multiRoute);
    }
    multiRoute = false;
}
function setRoute()
{
    removeRoute();
    var mode = $('#routingMode').val();
    var avoidTraffic = $('#avoidTraffic').is(':checked');
    var pointA = ($('#pointA-coord').val().length) ? $('#pointA-coord').val() : $('#pointA').val();
    var pointB = ($('#pointB-coord').val().length) ? $('#pointB-coord').val() : $('#pointB').val();

    multiRoute = new ymaps.multiRouter.MultiRoute({
        referencePoints: [
            pointA,
            pointB
        ],
        params: {
            routingMode: mode,
            avoidTrafficJams: avoidTraffic
        }
    }, {
        routeStrokeWidth: 1,
        routeActiveStrokeWidth: 4,
        routeStrokeColor: "#ffffff",
        routeActiveStrokeColor: "#122f5b",
        wayPointStartIconLayout: "default#image",
        wayPointStartIconImageHref: '/content/images/map-marker.png',
        wayPointStartContentSize: [10, 10],
        wayPointStartIconImageSize: [27, 36],
        wayPointStartIconImageOffset: [-13, -36],
        wayPointFinishIconLayout: "default#image",
        wayPointFinishIconImageHref: '/content/images/map-marker.png',
        wayPointFinishContentSize: [10, 10],
        wayPointFinishIconImageSize: [27, 36],
        wayPointFinishIconImageOffset: [-13, -36]
    });
    contactMap.geoObjects.add(multiRoute);

    /*ymaps.route([
        $('#pointA-coord').val(),
        $('#pointB-coord').val()
    ], {
        routingMode: mode,
        avoidTrafficJams: avoidTraffic,
        multiRoute: true
    }).then(function (route) {
            contactMap.geoObjects.add(route);
        });*/
}

function openPointDetails(num) {
    if ($('.point-detail[data-point='+num+']').is(':visible'))
        return false;

    removeRoute();
    closeAllPointDetails();
    //$('.points').hide();
    closeRoute();
    $('.point-detail[data-point='+num+']').show();

    var marker = markers[num];
    marker.active = true;
    markers[num] = marker;
    hoverMarker(num);
}
function closePointDetails(num)
{
    $('.point-detail[data-point='+num+']').hide();
    var marker = markers[num];
    marker.active = false;
    markers[num] = marker;
    blurMarker(num);
}
function closeAllPointDetails()
{
    $('.point-detail:visible').each(function(){
        var num = parseInt($(this).attr('data-point'));
        closePointDetails(num);
    });
}

$(function () {
  $('.point-detail .close').click(function () {
    var point = $(this).parent();
    var num = parseInt(point.attr('data-point'));
    closePointDetails(num);
    $('.points').show();
    return false;
  });

  //    $('.map-route-link').on('click', function(){
  //        $('.points').hide();
  //        openRoute();
  //        clearRoutes();
  //        return false;
  //    });
  $('.route .close').on('click', function () {
    $('.points').show();
    closeRoute();
    return false;
  });

  $('.contact-map .points a').on('mouseenter', function () {
    var num = parseInt($(this).attr('data-point'));
    hoverMarker(num);
  });
  $('.contact-map .points a').on('mouseleave', function () {
    var num = parseInt($(this).attr('data-point'));
    blurMarker(num);
  });
  $('.contact-map .points a').on('click', function () {
    var num = parseInt($(this).attr('data-point'));
    //openPointDetails(num);
    $(this).next().slideToggle('down');
    return false;
  });

  if ($('#contact-map') && $('#contact-map').length) {
    ymaps.ready(function () {
      contactMap = new ymaps.Map("contact-map",
                {
                  center: [center_latitude, center_longitude],
                  zoom: 11,
                  controls: [],
                  behaviors: ['drag']
                }
            );

      contactMap.events.add('click', function (e) {
        var coords = e.get('coords');
        if (routing) {
          ymaps.geocode(coords, {
            kind: 'house',
            results: 1
          }).then(function (res) {
            var firstGeoObject = res.geoObjects.get(0);
            var name = firstGeoObject.properties.get('name');
            //var text = firstGeoObject.properties.get('text');

            if (!$('#pointA').val().length)
              setRoutePoint(coords, name, 1);
            else if (!$('#pointB').val().length)
              setRoutePoint(coords, name, 2);
          });
        }
      });

      for (var j in contactPoints) {
        var point = contactPoints[j];
        var placemark = new ymaps.Placemark(point, {}, {
          iconLayout: 'default#imageWithContent',
          iconImageHref: '/content/images/spacer.png',
          iconImageSize: [44, 44],
          iconImageOffset: [-22, -22],
          iconContentSize: [44, 44],
          pointNum: j,
          iconContentLayout: ymaps.templateLayoutFactory.createClass('<span class="marker">' + j + '</span>')
        });
        placemark.events
                .add('mouseenter', function (e) {
                  var num = e.get('target').options.get('pointNum');
                  hoverMarker(num);
                })
                .add('mouseleave', function (e) {
                  var num = e.get('target').options.get('pointNum');
                  blurMarker(num);
                })
                .add('click', function (e) {
                  var num = e.get('target').options.get('pointNum');
                  openPointDetails(num);
                });
        contactMap.geoObjects.add(placemark);
        markers[j] = {
          placemark: placemark,
          active: false
        };
      }

      $('#zoom-in').click(function () {
        var zoom = contactMap.getZoom();
        if (zoom >= 17)
          return false;
        contactMap.setZoom(zoom + 1, { duration: 200 });
      });
      $('#zoom-out').click(function () {
        var zoom = contactMap.getZoom();
        if (zoom <= 1)
          return false;
        contactMap.setZoom(zoom - 1, { duration: 200 });
      });
    });
  }

  $('#points-change').on('click', function () {
    var pointA = $('#pointA').val();
    var pointA_coord = $('#pointA-coord').val();
    $('#pointA').val($('#pointB').val());
    $('#pointA-coord').val($('#pointB-coord').val());
    $('#pointB').val(pointA);
    $('#pointB-coord').val(pointA_coord);

    setRoute();
    return false;
  });

  //    $('.point-detail .content .btn').on('click', function(){
  //        var point = $(this).parent().parent();
  //        var num = parseInt(point.attr('data-point'));
  //        var coord = contactPoints[num];
  //        var name = $('.point .name', point).text();

  //        clearRoutes();
  //        setRoutePoint(coord, name, 2);

  //        closeAllPointDetails();
  //        openRoute();
  //        return false;
  //    });

  $('.route .btn').click(function () {
    setRoute();
    return false;
  });
  $('#routingMode').on('change', function () {
    setRoute();
  });
  $('#avoidTraffic').on('change', function () {
    setRoute();
  });
  $('#pointA').on('change', function () {
    $('#pointA-coord').val('');
  });
  $('#pointB').on('change', function () {
    $('#pointB-coord').val('');
  });
});