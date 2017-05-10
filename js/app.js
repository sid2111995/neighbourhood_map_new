var map; //Where my main map is stored
var k;
var service;
var infowindow; //Window that pop up when marker is clicked
var markers = []; // where all my markers are stored
var myRes = [];
var main_res = []; // for maintaining list of info
function initMap(){
     map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 31.6340,
            lng: 74.8723
        },
        zoom: 15

        
    });
      infowindow = new google.maps.InfoWindow({maxWidth: 100});

    fetchZomato();
    
}
// error handling
function callErrorMethod() {
    
    ViewModel.error( ' cant  Load the map' );
    ViewModel.isError( true );
}


// put content in info window
function populateInfoWindow( marker , infowindow)
{
    var content = marker.sres;

    if( infowindow.marker !== marker && infowindow.marker !== undefined )
    {
        infowindow.marker.setAnimation( null );
    }    
    
    infowindow.marker = marker;

    infowindow.marker.setAnimation( google.maps.Animation.BOUNCE );
    
    infowindow.setContent( content );
    
    infowindow.open( map , marker );

    infowindow.addListener('closeclick' , function() {
        infowindow.marker.setAnimation( null );
    });
}

// functions to show or hide all the markers
function hideMarkers() {

    for (var i = 0; i < markers.length; i++) {
        markers[i].setVisible(false);
    }
}


function showMarkers() { 
    for (var i = 0; i < markers.length; i++) {
        markers[i].setVisible(true);
    }
    
}
k = 0;
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
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < resList.length; i++) {
            //res = '<h1>'+response.location.title+'</h1>';
            res = '<img src = "'+ resList[i].restaurant.featured_image + '" class = "res-image">';
            res += '<h2>' + resList[i].restaurant.name + '</h2>';
        main_res[i] = res;
        var myLatlng = new google.maps.LatLng(parseFloat(resList[i].restaurant.location.latitude),parseFloat(resList[i].restaurant.location.longitude));
        if(myLatlng.lat()==0)continue;
        
        var marker = new google.maps.Marker({
            position: myLatlng,
            title: resList[i].restaurant.name,
            animation: google.maps.Animation.DROP,
            sres: main_res[i],
            map:map
            
        });
        bounds.extend(marker.position);
        
        marker.addListener('click', function(){
            populateInfoWindow(this, infowindow);
        });
        markers.push(marker);
    }
    map.fitBounds(bounds);
    ViewModel.init();
       
    }).fail(function(response,status, error){
        ViewModel.isError(true);
        ViewModel.error('Cant fetch Zomato"s restaurant List');
    });
}

function highlightMarker( markerTitle ) {

    for( var i in markers )
    {
        if( markers[ i ].title == markerTitle )
        {
            populateInfoWindow( markers[ i ] , infowindow );
            return;
        }    
    }    
}


// View model to apply knockout js
var ViewModel = {
    
    restaurantList : ko.observableArray(),
    searchText : ko.observable(''),
    isError : ko.observable( false ),
    error : ko.observable(''),

    init : function() {
        for( var marker in markers )
        {
            //console.log( markers[marker] );
            ViewModel.restaurantList.push( markers[marker].title );
        }    
    },

    findRestaurant : function( text ){
        ViewModel.restaurantList.removeAll();
        for( var i in markers )
        {
            if( markers[ i ].title.toLowerCase().indexOf( text.toLowerCase() ) > -1 )
            {
                ViewModel.restaurantList.push( markers[ i ].title );
                markers[ i ].setVisible( true );
            }
            else
            {
                markers[ i ].setVisible( false );    
            }    
        }   
    },

}
ko.applyBindings(ViewModel);
ViewModel.searchText.subscribe( ViewModel.findRestaurant );
