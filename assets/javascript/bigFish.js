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
var myKey = null;
var gameOver = false;

var reverseMappingDbKeyToMarker = [];

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
      setPlayerName($('#player-name').val().trim());
      $('#player-name').val('');
    });

  // Enables bottom collapsible
  $(document).ready(function(){      
    generateRandomLatLngCPUFish();
    $('.collapsible').collapsible('open', 0);
  });
  
  function initMap() {
    const DEFAULT_MAP_CENTER = {lat: 0, lng: 0};
    const DEFAULT_MAP_ZOOM = 1;
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: DEFAULT_MAP_ZOOM,
      center: DEFAULT_MAP_CENTER
    });
    if (getPlayerName() == null ) {
      login();
    } else {loadPlayer();}

    // Show menu on New Game button click
    $('#new-game').on('click', function(event) {
      event.preventDefault();
      var fishKey = localStorage.myKey;
      if(typeof fishKey !== "undefined") {
        controlHighlightOfMarker(fishKey, false);
      }
      emptyLocalStorageFishInfo();
      login();
    });   

  // Button for searching for username
  $('#find-fish-name').on('click', function(event) {
    event.preventDefault();
    var fishLoginKey = $('#find-name').val().trim();
    var loggedInFish = getDbFishRepresentationByKey(fishLoginKey);
    if(loggedInFish) {
      loggedInFish.once("value", function(snapshot) {
        var snapshotValue = snapshot.val();
        if(snapshotValue) {
          setAllLocalStorageFishInfo(fishLoginKey, snapshotValue.name, snapshotValue.lat, snapshotValue.lng, snapshotValue.level);
          controlHighlightOfMarker(fishLoginKey, true);
          $('#find-name').val('');
          $('#username-modal').modal('close');
          loadPlayer();
        } else {
          $('#invalid-key-login-message').show();
          setTimeout(function(){ $('#invalid-key-login-message').hide(); }, 5000);
        }
      });
    } 
  });

    function emptyLocalStorageFishInfo() {
      localStorage.removeItem("name");
      localStorage.removeItem("myKey");
      localStorage.removeItem("level");
      localStorage.removeItem("latitude");
      localStorage.removeItem("longitude");
    }
    /**
    * Can either highlight or unhighlight the marker representing a fish's marker specified by a certain key.
    */
    function controlHighlightOfMarker(key, isGoingToHighlight) {
      var markerToUnhighlight = getMarkerAssociatedWithDbKey(key);
      if(markerToUnhighlight) {
        var markerLevel = markerToUnhighlight.customInfo.level;
        markerToUnhighlight.setIcon(levelImg(markerLevel, isGoingToHighlight));
      }
    }
    function getMarkerAssociatedWithDbKey(key) {
      var marker = null;
      if(typeof reverseMappingDbKeyToMarker !== "undefined" 
        && reverseMappingDbKeyToMarker.constructor === Array 
        && typeof reverseMappingDbKeyToMarker[key] !== "undefined") {
        marker = reverseMappingDbKeyToMarker[key];
      }
      return marker;
    }
    function getDbFishRepresentationByKey(key) {
      return (database && database.ref('fish/')) ? database.ref('fish/').child(key) : null;
    }
    function deleteFishInDbByKey(key) {
      var oldFish = getDbFishRepresentationByKey(key);
      if(oldFish) {
        oldFish.remove();
      }
    }

    // Player initial position select
    google.maps.event.addListener(map, 'click', function(event) {
      if (localStorage.getItem('myKey') == null) {
        var latLng = event.latLng;
        var latitude = latLng.lat();
        var longitude = latLng.lng();
        var playerName = getPlayerName();

        addMarker(latitude, longitude, playerName, 1, true);
        $('#player-pin-lat').text(parseInt(latitude));
        $('#player-pin-lng').text(parseInt(longitude));
      } 
    });

    // Whenever a fish gets added to the database, then it gets displayed on the frontend, too.
    database.ref('fish/').on("child_added", function(childSnapshot) {
      var childSnapshotVal = childSnapshot.val();
      var markerKey = childSnapshot.key;
      showMarkerOnFrontend(childSnapshotVal.lat, childSnapshotVal.lng, childSnapshotVal.name, childSnapshotVal.level, childSnapshot);
    }, function(errorObject) {
      console.log('Errors handled: ' + errorObject.code);
    });

    database.ref('fish/').on("child_removed", function(childSnapshot) {
      var childSnapshotVal = childSnapshot.val();
      var key = childSnapshot.key;
      var targetMarker = reverseMappingDbKeyToMarker[key];
      var targetLat = targetMarker.position.lat();
      var targetLng = targetMarker.position.lng();
      // Removes the fish that gets eaten on fronted in real time. 
      // This means it removes the pin representing the fish that gets deleted in the database.
      var eatenFishMarker = reverseMappingDbKeyToMarker[key];
      eatenFishMarker.setMap(null);
      if (key == localStorage.getItem('myKey')) {
        gameOver = true;
        login();
      }
    }, function(errorObject) {
      console.log('Errors handled: ' + errorObject.code);
    });
    database.ref('fish/').on("child_changed", function(childSnapshot) {
      var changedFishMarker = reverseMappingDbKeyToMarker[childSnapshot.key];
      changedFishMarker.setPosition({lat: childSnapshot.val().lat, lng: childSnapshot.val().lng});
      changedFishMarker.customInfo.level = childSnapshot.val().level;
      var isMyFish = (childSnapshot.key == localStorage.myKey);
      changedFishMarker.icon = levelImg(childSnapshot.val().level, isMyFish);
    });

    var connectedRef = database.ref(".info/connected");
    // When the client's connection state changes...
    connectedRef.on("value", function(snap) {
      // If they are connected..
      if (snap.val()) {
        if(localStorage.getItem("myKey")) {
          var myFish = getDbFishRepresentationByKey(localStorage.getItem("myKey"));
          myFish.on('value', function(snapShot) {
            var snapShotValue = snapShot.val();
            if(!snapShotValue) {
              gameOver = true;
              login();
            }
          });
        }
      }
    });
  }

  // Prompts user with login menu
  function login() {
    $('.modal').modal({
      dismissible: false
    });

    if (gameOver) {
      $('#gameover-modal').modal('open');
      $('#death-level').text('You made it to level ' + localStorage.getItem('level') + '!');
      emptyLocalStorageFishInfo();
      gameOver = false;
    } else {
      $('#intro-modal').modal('open');
    }

    $('#start-over').on('click', function(event) {
      $('#new-fish-modal').modal('open');
    });

    $('#exist-fish').on('click', function(event) {
      event.preventDefault();
      $('#username-modal').modal('open');
    });

    // Hitting 'No' when asked if user has existing fish
    $('#new-fish').on('click', function() {
      $('#new-fish-modal').modal('open');
      localStorage.clear();
    });

    // Back button on username search modal
    $('#back-btn').on('click', function(event) {
      event.preventDefault();
      $('#find-name').val('');
      $('#username-modal').modal('close');
      $('#intro-modal').modal('open');
    });

    // Hitting 'Submit' when creating a fish name
    $('#submit-fish-name').on('click', function(event) {
      event.preventDefault();
      $('#player-pin-name, #player-pin-level, #player-pin-lat, #player-pin-lng').text('');
      $('#player-fish').attr('src', 'assets/images/tuna1.png');
      var specifiedName = $('#record-name').val().trim();
      if ( specifiedName !== '') {
        setPlayerName(specifiedName);
        $('#record-name').val('');
        $('#new-fish-modal').modal('close');
        $('#player-pin-name').text(getPlayerName());
      }
    });


  }

  function getPlayerName() {
    return localStorage.getItem("name");
  }
  function setPlayerName(name) {
    localStorage.setItem("name", name);
  }



      function setAllLocalStorageFishInfo(fishKey, name, latitude, longitude, level) {
        localStorage.setItem("myKey", fishKey);
        localStorage.setItem("name", name);
        localStorage.setItem("latitude", latitude);
        localStorage.setItem("longitude", longitude);
        localStorage.setItem("level", level);
      }

  // Loads player fish onto screen
  function loadPlayer() {
    var userName = getPlayerName();
    var loadedLat = parseInt(localStorage.getItem("latitude"));
    var loadedLng = parseInt(localStorage.getItem("longitude"));
    var loadedLvl = localStorage.getItem("level");
    var loginKey = localStorage.getItem("myKey");
    myKey = loginKey;

    updatePlayerFishStatsText(userName, loadedLvl, loadedLat, loadedLng, loginKey);
    setBigFishImage(loadedLvl);
  }

  function updatePlayerFishStatsText(name, level, lat, lng, loginKey) {
    $('#player-pin-name').text(name);
    $('#player-pin-level').text(level);
    $('#player-pin-lat').text(lat);
    $('#player-pin-lng').text(lng);
    $('#player-pin-login-key').text(loginKey);
  }

  function setBigFishImage(loadedLvl) {
    var $playerFish = $('#player-fish');
    if (loadedLvl <= 1) {
      $playerFish.attr('src', 'assets/images/tuna1.png');
    } else if (loadedLvl <= 2) {
      $playerFish.attr('src', 'assets/images/swordfish1.png');
    } else if (loadedLvl <= 3) {
      $playerFish.attr('src', 'assets/images/shark.png');
    } else {
      $playerFish.attr('src', 'assets/images/monster.png');
    }
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
      $('#player-pin-level').text(level);
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
    var isMarkerMyFish = isIconHighlighted;
    if(isMarkerMyFish) {
      centerMapAtMarker(marker);
    }

    // Creates a way for the pin to get deleted or updated in real time, should a database change for a fish occur.
    reverseMappingDbKeyToMarker[marker.customInfo.key] = marker;

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
              // Animations for eating a fish
              $('#player-fish').addClass('animated rubberBand');
              $('#munch').css('display', 'inline');
              $('#munch').addClass('animated fadeInUp');
              $('#player-fish').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                $(this).removeClass('animated rubberBand');
              });
              $('#munch').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                $(this).removeClass('animated fadeInUp');
                $(this).css('display', 'none');
              });
              // User fish gets updated here, when it eats another fish.
              updateMyFish(targetLat, targetLng, parseInt(localStorage.getItem("level")) + 1);
              $('#player-pin-level').text(parseInt(myLevel) + 1);
              $('#player-pin-lat').text(parseInt(targetLat));
              $('#player-pin-lng').text(parseInt(targetLng));
            }
          }
        });
      }
    });

    google.maps.event.addDomListener(marker, 'mouseover', function(e) {
      $("#fish-pin-name").text(this.customInfo.name);
      $("#fish-pin-level").text(this.customInfo.level);
      $("#fish-pin-lat").text(parseInt(this.position.lat()));
      $("#fish-pin-lng").text(parseInt(this.position.lng()));
      var weatherReport = getWeatherReport(this.position.lat(),this.position.lng());      
    });
    
    google.maps.event.addDomListener(marker, 'mouseout', function(e) {
      $("#fish-pin-name").text("");
      $("#fish-pin-level").text("");
      $("#fish-pin-lat").text("");
      $("#fish-pin-lng").text("");
      $('#temp, #sunrise, #sunset, #weather-detail').text("");
    });
  }

  function updateMyFish(updatedLat, updatedLng, currentLevel) {
    // TODO implement.
    var fishKey = localStorage.getItem("myKey");
    var fishRef = database.ref("fish").child(fishKey);
    var upgradeLevel = parseInt(currentLevel);
    fishRef.update({"level": upgradeLevel, "lat": updatedLat, "lng": updatedLng});

    if (upgradeLevel >= 2) {
      $('#player-fish').attr('src', 'assets/images/swordfish1.png');
    }
    if (upgradeLevel >= 3) {
      $('#player-fish').attr('src', 'assets/images/shark.png');
    }
    if (upgradeLevel >= 4) {
      $('#player-fish').attr('src', 'assets/images/monster.png');
    }

    localStorage.setItem("level", upgradeLevel);
    localStorage.setItem("latitude", updatedLat);
    localStorage.setItem("longitude", updatedLng);
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

  /**
  * Displays cpufish randomly on the map. Every 30 seconds 1 fish is displayed.
  */
  function generateRandomLatLngCPUFish() {
    counter = 1;
    setInterval(getLatLng, 300*1000);
  }

  /**
  * Calculates random latitude and longitude for cpuFish.
  */
  function getLatLng() {    
    var randomLng = 0, randomLat = 0, data_name="cpuFish", cpuFishLevel = 0;
    data_name = data_name + counter;
    randomLat = generateRandomLatLng(-85, 85, 3);
    randomLng = generateRandomLatLng(-180, 180, 3);      
    addMarker(randomLat, randomLng, data_name, 0);
    counter++;
  }

  //random generator
  function generateRandomLatLng(from, to, fixed) {
    return ( (Math.random() * (to - from) + from).toFixed(fixed) * 1 );
  }

  //function to get weather details based on lat/lng
  function getWeatherReport(lat, lng) {
    var markerLat = lat, markerLng = lng, messageToDisplayInHTML="No Result From API";
    var queryURL = 'https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/weather?lat='+markerLat+'&lon='+markerLng+
    '&appid=143499e04ed7429a089d8617a8425c15';
    console.log(queryURL);
    $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response) {
      console.log(response);
      console.log("weather " + response.weather[0]);
      var temp = response.main.temp;
      temp = Math.floor((temp - 273.15) * 1.80 + 32);
      console.log("temp - " + temp);
      var sunrise = msToTime(response.sys.sunrise) + " AM";
      console.log("sunrise - " + sunrise);
      var sunset = msToTime(response.sys.sunset) + " PM";
      console.log("sunset - " + sunset);
      messageToDisplayInHTML = "Weather Details - Main: " + response.weather[0].main + ", Description: " + 
      response.weather[0].description + ", Temperature (F): " + temp + ", Sunrise Time: " + sunrise +
      ", Sunset Time: " + sunset;
      console.log(messageToDisplayInHTML);
      $('#temp').text(temp);
      $('#sunrise').text(sunrise);
      $('#sunset').text(sunset);
      $('#weather-detail').text(response.weather[0].main + ', ' + response.weather[0].description);
      return messageToDisplayInHTML;
    });   
  }

  //function to convert milliseconds to time format hh:mm:ss
  function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100),
    seconds = parseInt((duration/1000)%60),
    minutes = parseInt((duration/(1000*60))%60),
    hours = parseInt((duration/(1000*60*60))%24);
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
  }
