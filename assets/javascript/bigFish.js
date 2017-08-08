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
  var icons = {
          level0: {
            icon: 'assets/images/fish-level-0.png'            
          },
          level1: {
            icon: 'assets/images/fish-level-1.png'
          },
          level2: {
            icon: 'assets/images/fish-level-2.png'
          },
          level3: {
            icon: 'assets/images/fish-level-3.png'
          },
          level4: {
            icon: 'assets/images/fish-level-4.png'
          }
        };
  
  function initMap() {
    var uluru = {lat: -25.363, lng: 131.044};
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: uluru
    });
    var marker = new google.maps.Marker({
      position: uluru,
      icon: icons.level0.icon,
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
      icon: icons.level4.icon,
      map: map
    });
  }


  function generateRandomLatLngCPUFish() {
    var randonLng = 0, randomLat = 0, randomCount=50;
    var min=-180, max=180, fixed=3;
    for (var i = 0; i < randomCount; i++) {
      randomLat = generateRandomLatLng(to, from, fixed);
      randomLng = generateRandomLatLng(to, from, fixed);      
    }
  }

  function generateRandomLatLng(to, from, fixed) {
    return ( (Math.random() * (to - from) + from).toFixed(fixed) * 1 );
  }
