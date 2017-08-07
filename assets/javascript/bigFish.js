  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBDETBXl4ZLh_0lrEcF-3zJLEUd25Hnji0",
    authDomain: "fish-project-ca094.firebaseapp.com",
    databaseURL: "https://fish-project-ca094.firebaseio.com",
    projectId: "fish-project-ca094",
    storageBucket: "fish-project-ca094.appspot.com",
    messagingSenderId: "542377547666"
  };
  firebase.initializeApp(config);

  $(document).ready(function(){
    $('.collapsible').collapsible();
  });

  var database = firebase.database();
  var map = null;
  
  function initMap() {
    var uluru = {lat: -25.363, lng: 131.044};
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: uluru
    });
    var marker = new google.maps.Marker({
      position: uluru,
      map: map
    });

    google.maps.event.addListener(map, 'click', function(event) {
      var latLng = event.latLng;
      var latitude = latLng.lat();
      var longitude = latLng.lng();
      saveAddedMarker(latitude, longitude);
    });

    database.ref().on("value", function(snapshot) {
      console.log(snapshot.val());
    });
    database.ref().on("child_added", function(childSnapshot) {
        placeMarker(childSnapshot.val().lat, childSnapshot.val().lng);
    }, function(errorObject) {
        console.log('Errors handled: ' + errorObject.code);
    });
  }
  function saveAddedMarker(latitude, longitude) {
    database.ref().push({lat: latitude, lng: longitude});
  }
  function placeMarker(latitude, longitude) {
    var markerLocation = {lat: latitude, lng: longitude};
    var marker = new google.maps.Marker({
      position: markerLocation,
      map: map
    });
  }
