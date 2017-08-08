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

  $("#create-fish").on('click', function() {
    event.preventDefault();
    playerName = $('#player-name').val().trim();
    $('#player-name').val('');
  })

  $(document).ready(function(){
    $('.collapsible').collapsible();
    login();
  });

  function login() {
    $('#intro-modal, #new-fish-modal').modal({
      dismissible: false
    });
    $('#intro-modal').modal('open');
    $('#exist-fish').on('click', function() {
      return;
    });
    $('#new-fish').on('click', function() {
      $('#new-fish-modal').modal('open');
    });
    $('#submit-fish-name').on('click', function(event) {
      event.preventDefault();
      var tmp = $('#record-name').val().trim();
      if ( tmp == '') {}
      else {      
        $('#new-fish-modal').modal('close');
        playerName = $('#record-name').val().trim();
      }
    });
  }

  var database = firebase.database();

  var map = null;
  var playerName = '';
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
      icon: icons.level0.icon,
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
