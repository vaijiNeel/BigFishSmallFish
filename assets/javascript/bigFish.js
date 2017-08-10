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

  // Records new fish name created by player
  $("#create-fish").on('click', function() {
    event.preventDefault();
    playerName = $('#player-name').val().trim();
    $('#player-name').val('');
  });

  // Enables bottom collapsible
  $(document).ready(function(){
    $('.collapsible').collapsible('open', 0);

  });

  var database = firebase.database();
  var map = null;
  var timerOn= false;
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
    console.log(localStorage.getItem('name'));
    if (localStorage.getItem('name') == null ) {
      login();
    } else {loadPlayer();}
    

    // Player initial position select
    google.maps.event.addListener(map, 'click', function(event) {
      if (localStorage.getItem('name') == null) {
        var latLng = event.latLng;
        var latitude = latLng.lat();
        var longitude = latLng.lng();
        // saveAddedMarker(latitude, longitude, playerName, 0);
        placeMarker(latitude, longitude, playerName, 1);
        localStorage.setItem("name", playerName);
        localStorage.setItem("latitude", latitude);
        localStorage.setItem("longitude", longitude);
        localStorage.setItem("level", 1);
      } 
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

  // Prompts user with login menu
  function login() {
    $('#intro-modal, #new-fish-modal, #username-modal').modal({
      dismissible: false
    });
    $('#intro-modal').modal('open');
    $('#exist-fish').on('click', function(event) {
      event.preventDefault();
      $('#username-modal').modal('open');
    });
    $('#new-fish').on('click', function() {
      $('#new-fish-modal').modal('open');
      localStorage.clear();
    });
    $('#submit-fish-name').on('click', function(event) {
      event.preventDefault();
      var tmp = $('#record-name').val().trim();
      if ( tmp !== '') {
        playerName = $('#record-name').val().trim();
        $('#new-fish-modal').modal('close');
      }
    });
    $('#find-fish-name').on('click', function(event) {
      event.preventDefault();
      var tmp = $('#find-name').val().trim();
      // needs to check if entered username is in the firebase database
      }
    })
  }

  // Loads player fish onto screen
  function loadPlayer() {
    var tmpName = localStorage.getItem("name");
    var tmpLat = parseInt(localStorage.getItem("latitude"));
    var tmpLong = parseInt(localStorage.getItem("longitude"));
    var tmpLvl = localStorage.getItem("level");
    placeMarker(tmpLat, tmpLong, tmpName, tmpLvl);
  }

  function saveAddedMarker(latitude, longitude, name, level) {
    database.ref('fish/').push({lat: latitude, lng: longitude, name: name, level: level});
  }

  function placeMarker(latitude, longitude, name, level) {
    var markerLocation = {lat: latitude, lng: longitude};
    var marker = new google.maps.Marker({
      position: markerLocation,
      icon: levelImg(level),   
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

  function levelImg(level) {
    if(level<=10)
      return icons.level0.icon;
    else if(level>10 && level<=20)
      return icons.level1.icon;
    else if(level>20 && level<=30)
      return icons.level2.icon;
    else if(level>30 && level<=40)
      return icons.level3.icon;
    else if(level>40)
      return icons.level4.icon;
  }

  function stopTimer() {
    clearTimeout(t);
    timerOn = false;  
  }

  function generateRandomLatLngCPUFish() {
    if (!timerOn) {
        timerOn = true;
        intervalId = setInterval(decrement, 1000);
        getLatLng();
    }
    
  }

  function getLatLng() {
    
    var randonLng = 0, randomLat = 0;
    for (var i = 0; i < randomCount; i++) {
      //get random lat/lng
      randomLat = generateRandomLatLng(90, -90, 3);
      randomLng = generateRandomLatLng(180, -180, 3);      
    }
  }

  function generateRandomLatLng(to, from, fixed) {
    return ( (Math.random() * (to - from) + from).toFixed(fixed) * 1 );
  }
