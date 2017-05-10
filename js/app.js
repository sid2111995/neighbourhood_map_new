var map;
var service;
var infowindow;
var markers = [];
var myRes = [];

function initMap(){
     map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 31.6340,
            lng: 74.8723
        },
        zoom: 15

        
    });
      infowindow = new google.maps.InfoWindow();
    //  var request = {
    //         location: {
    //              lat: 31.6340,
    //              lng: 74.8723
    //         },
    //         radius: '500',
    //         types: ['restaurant']
    // };
    //     service = new google.maps.places.PlacesService(map);
    //     service.nearbySearch(request, callback);
    fetchZomato();
    //showMarkers();
    //console.log(markers);
}

function populateInfoWindow( marker , infowindow, res )
{
    var content = res;
    infowindow.setContent( content );
    infowindow.open( map , marker );
    // infowindow.addListener('closeclick' , function(){

    // });
}
function showMarkers() {
    console.log("Kidaaa");
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        console.log(markers[i].position);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}
function fetchZomato() {
    $.ajax({
        url : 'https://developers.zomato.com/api/v2.1/geocode',
        headers: {
            'Accept' : 'application/json',
            'user-key' : '4f8a91482638c2c678cfd7410ef0de76'
        },
        data: 'lat=31.6340&lon=74.8723',
        async: true,
    }).done(function(response){
        var res = '';
        var resList = response.nearby_restaurants;
        for (var i = 0; i < resList.length; i++) {
            //res = '<h1>'+response.location.title+'</h1>';
            res = '<img src = "'+ resList[i].restaurant.featured_image + '" class = "res-image">';
            res += '<h2>' + resList[i].restaurant.name + '</h2>';
        
        var myLatlng = new google.maps.LatLng(parseFloat(resList[i].restaurant.location.latitude),parseFloat(resList[i].restaurant.location.longitude));
        if(myLatlng.lat()==0)continue;
        
        var marker = new google.maps.Marker({
            position: myLatlng,
            title: resList[i].restaurant.name,
            animation: google.maps.Animation.DROP,
            
        });
        marker.addListener('click', function(){
            populateInfoWindow(this, infowindow, res);
        });
        markers.push(marker);
    }
       
    }).fail(function(response,status, error){
        console.log("Can't Fetch");
    });
}

function createMarker( place ){
    var marker = new google.maps.Marker({
          position: {
           lat: place.geometry.location.lat(),
           lng: place.geometry.location.lng()
          },
          map: map,
          title: place.name
        });
    marker.addListener('click', function(){
        populateInfoWindow( this , infowindow );
    });
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(results[i]);
    }
  }
}

var ViewModel = {

}
ko.applyBindings(ViewModel);