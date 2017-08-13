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
  var playerName = '';
  var myKey = null;

  var counter=1;
  var icons = {
    level0: {
      icon: 'assets/images/fish-level-0.png',
      highlightedIcon: 'assets/images/fish-level-0-highlighted.png'             
    },
    level1: {
      icon: 'assets/images/fish-level-1.png',
      highlightedIcon: 'assets/images/fish-level-1-highlighted.png'
    },
    level2: {
      icon: 'assets/images/fish-level-2.png',
      highlightedIcon: 'assets/images/fish-level-2-highlighted.png'
    },
    level3: {
      icon: 'assets/images/fish-level-3.png',
      highlightedIcon: 'assets/images/fish-level-3-highlighted.png'
    },
    level4: {
      icon: 'assets/images/fish-level-4.png',
      highlightedIcon: 'assets/images/fish-level-4-highlighted.png'
    }
  };

    // Records new fish name created by player
  $("#create-fish").on('click', function() {
    event.preventDefault();
    playerName = $('#player-name').val().trim();
    $('#player-name').val('');
  });

  // Enables bottom collapsible
  $(document).ready(function(){      
    // generateRandomLatLngCPUFish();
    $('.collapsible').collapsible('open', 0);
  });
  
  function initMap() {
    var myName = "Iris";
    var uluru = {lat: -25.363, lng: 131.044};
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: uluru
    });
    if (localStorage.getItem('name') == null ) {
      login();
    } else {loadPlayer();}    

    // Player initial position select
    google.maps.event.addListener(map, 'click', function(event) {
      // if (localStorage.getItem('name') == null) {
        var latLng = event.latLng;
        var latitude = latLng.lat();
        var longitude = latLng.lng();

        addMarker(latitude, longitude, playerName, 1, true);
      // } 
    });

    // Whenever a fish gets added to the database, then it gets displayed on the frontend, too.
    database.ref('fish/').on("child_added", function(childSnapshot) {
      var childSnapshotVal = childSnapshot.val();
      var markerKey = childSnapshot.key;
      showMarkerOnFrontend(childSnapshotVal.lat, childSnapshotVal.lng, childSnapshotVal.name, childSnapshotVal.level, childSnapshot);
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
    })
  }

  // Loads player fish onto screen
  function loadPlayer() {
    playerName = localStorage.getItem("name");
    var tmpName = localStorage.getItem("name");
    var tmpLat = parseInt(localStorage.getItem("latitude"));
    var tmpLong = parseInt(localStorage.getItem("longitude"));
    var tmpLvl = localStorage.getItem("level");
    myKey = localStorage.getItem("myKey");
    // addMarker(tmpLat, tmpLong, tmpName, tmpLvl);
  }

  /**
  * Adds a new marker. Saves the marker to the database.
  */
  function addMarker(latitude, longitude, name, level, isMyNewlyAddedFish = false) {
    if(isMyNewlyAddedFish) {
      localStorage.setItem("myKey", "");
      localStorage.setItem("name", name);
      localStorage.setItem("latitude", latitude);
      localStorage.setItem("longitude", longitude);
      localStorage.setItem("level", level);
    }
    var justAddedUserMarker = database.ref('fish/').push({lat: latitude, lng: longitude, name: name, level: level});
    if(isMyNewlyAddedFish) {
      var myKey = justAddedUserMarker.key;
      localStorage.setItem("myKey", myKey);
      myKey = myKey;
    }
  }

  /**
  * Displays a marker on the map, given the marker data. To add a new marker, use the addMarker() function.
  * This function only accounts for getting a marker to display on the frontend, NOT for adding a marker to the database.
  */
  function showMarkerOnFrontend(latitude, longitude, name, level, dataSnapshot) {
    var markerLocation = {lat: latitude, lng: longitude};
    var customData = {"name": name, "level": level, "key": dataSnapshot.key};
    var isIconHighlighted = false;
    if(typeof localStorage.myKey !== "undefined" && localStorage.myKey != "") {
      isIconHighlighted = (localStorage.myKey === dataSnapshot.key);
    } else if(typeof localStorage.name !== "undefined" && localStorage.name != "" && typeof localStorage.latitude !== "undefined" && typeof localStorage.longitude !== "undefined") {
      isIconHighlighted = (localStorage.getItem("name") == dataSnapshot.val().name && localStorage.getItem("latitude") == dataSnapshot.val().lat
                            && localStorage.getItem("longitude") == dataSnapshot.val().lng);
    }
    var iconImage = levelImg(level, isIconHighlighted);
    var marker = new google.maps.Marker({
      position: markerLocation,
      icon: iconImage,   
      map: map,     
      customInfo: customData
    });

    google.maps.event.addDomListener(marker, 'click', function(e) {
      // Eating of other fish occurs here.
      var myFishKey = localStorage.getItem("myKey");
      var targetFishKey = this.customInfo.key;
      if(myFishKey !== targetFishKey) {
        var targetFish = database.ref("fish").child(targetFishKey);
        var myFish = database.ref("fish").child(myFishKey);
        var targetLat = null;
        var targetLng = null;
        var targetLevel = null;
        var myLevel = null;
        targetFish.once("value", function(snapshot) {
          targetLat = snapshot.val().lat;
          targetLng = snapshot.val().lng;
          targetLevel = snapshot.val().level;
          myLevel = localStorage.getItem("level");
          if(myLevel !== null && targetLevel !== null && targetLat !== null && targetLng !== null) {
            if(myLevel > targetLevel) {
              targetFish.remove();
              // TODO update user fish here.
              updateMyFish(targetLat, targetLng, parseInt(localStorage.getItem("level")) + 1);
            }
          }
        });
      }
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

  function updateMyFish(updatedLat, updatedLng, currentLevel) {
    // TODO implement.
    var fishKey = localStorage.getItem("myKey");
    var fishRef = database.ref("fish").child(fishKey);
    var upgradeLevel = parseInt(currentLevel);
    fishRef.update({"level": upgradeLevel, "lat": updatedLat, "lng": updatedLng});
    localStorage.setItem("level", upgradeLevel);
    localStorage.setItem("lat", updatedLat);
    localStorage.setItem("lng", updatedLng);
  }

  function levelImg(level, isHighlighted) {
    var iconLevel = icons.level0;
    if(level>0 && level<=1) {
      iconLevel = icons.level1;
    } else if(level>1 && level<=2) {
      iconLevel = icons.level2;
    } else if(level>2 && level<=3) {
      iconLevel = icons.level3;
    } else if(level>3) {
      iconLevel = icons.level4;    
    }
    var iconImage = (isHighlighted) ? iconLevel.highlightedIcon : iconLevel.icon;
    return iconImage;
  }

  //centers the map at clicked marker. 
  function centerMapAtMarker(marker) {
    //if you need animation use panTo, else use setCenter    
    // map.setCenter(marker.getPosition());
    map.panTo(marker.getPosition());
  }

  // function emptyCPUFish(){
  //   database.ref('fish/').remove();
  // }

  function generateRandomLatLngCPUFish() {
    counter=1;
    // getLatLng();
    setInterval(getLatLng, 30*1000);
  }

  function getLatLng() {    
    var randonLng = 0, randomLat = 0, data_name="cpuFish", cpuFishLevel = 0;
    //get random lat/lng
    data_name = data_name + counter;
    randomLat = generateRandomLatLng(-85, 85, 3);
    randomLng = generateRandomLatLng(-180, 180, 3);      
    addMarker(randomLat, randomLng, data_name, cpuFishLevel);
    counter++;
  }

  function generateRandomLatLng(from, to, fixed) {
    return ( (Math.random() * (to - from) + from).toFixed(fixed) * 1 );
  }
