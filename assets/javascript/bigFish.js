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

  var database = firebase.database();
  var map = null;
  
  function initMap() {
    var myName = "Iris";
    var uluru = {lat: -25.363, lng: 131.044};
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: uluru
    });

    google.maps.event.addListener(map, 'click', function(event) {
      var latLng = event.latLng;
      var latitude = latLng.lat();
      var longitude = latLng.lng();
      saveAddedMarker(latitude, longitude, myName, 0);
    });

    database.ref('fish/').on("value", function(snapshot) {
      console.log(snapshot.val());
    });
    database.ref('fish/').on("child_added", function(childSnapshot) {
        var childSnapshotVal = childSnapshot.val();
        placeMarker(childSnapshotVal.lat, childSnapshotVal.lng, childSnapshotVal.name, childSnapshotVal.level);
    }, function(errorObject) {
        console.log('Errors handled: ' + errorObject.code);
    });
  }
  function saveAddedMarker(latitude, longitude, name, level) {
    database.ref('fish/').push({lat: latitude, lng: longitude, name: name, level: level});
  }
  function placeMarker(latitude, longitude, name, level) {
    var markerLocation = {lat: latitude, lng: longitude};
    var marker = new google.maps.Marker({
      position: markerLocation,
      map: map,
      customInfo: {name, level}
    });
    // google.maps.event.addDomListener(window, 'load', initialize);
    google.maps.event.addDomListener(marker, 'click', function(e) {
      alert("clicked marker");
    });
    google.maps.event.addDomListener(marker, 'mouseover', function(e) {
      $("#fish-pin-name").text(this.customInfo.name);
      $("#fish-pin-level").text(this.customInfo.level);
      $("#fish-pin-lat").text(this.position.lat());
      $("#fish-pin-lng").text(this.position.lng());
    });
    google.maps.event.addDomListener(marker, 'mouseout', function(e) {
      $("#fish-pin-name").text("");
      $("#fish-pin-level").text("");
      $("#fish-pin-lat").text("");
      $("#fish-pin-lng").text("");
    });
  }
