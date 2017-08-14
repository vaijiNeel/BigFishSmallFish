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
    generateRandomLatLngCPUFish();
    $('.collapsible').collapsible('open', 0);
  });

  var database = firebase.database();
  var map = null;
  var playerName = '';
  var playerLevel = 1;
  var userLocal = 'https://fish-project-ca094.firebaseio.com/';

  var counter=1;
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

    // Show menu on New Game button click
    $('#new-game').on('click', function(event) {
      event.preventDefault();
      login();
    });

    // Player initial position select
    google.maps.event.addListener(map, 'click', function(event) {
      
      if (localStorage.getItem('name') == null) {
        var latLng = event.latLng;
        var latitude = parseInt(latLng.lat());
        var longitude = parseInt(latLng.lng());

        addMarker(latitude, longitude, playerName, 1);

        localStorage.setItem("name", playerName);
        localStorage.setItem("latitude", latitude);
        localStorage.setItem("longitude", longitude);
        localStorage.setItem("level", 1);
        $('#player-pin-lat').text(latitude);
        $('#player-pin-lng').text(longitude);
      } 
    });

    database.ref('fish/').on("value", function(snapshot) {
      console.log(snapshot.val());
    });

    // Whenever a fish gets added to the database, then it gets displayed on the frontend, too.
    database.ref('fish/').on("child_added", function(childSnapshot) {
        var childSnapshotVal = childSnapshot.val();
        showMarkerOnFrontend(childSnapshotVal.lat, childSnapshotVal.lng, childSnapshotVal.name, childSnapshotVal.level);
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
      $('#player-pin-name, #player-pin-level, #player-pin-lat, #player-pin-lng').text('');
      playerLevel = 1;
      $('#player-fish').attr('src', 'assets/images/tuna1.png');
      localStorage.clear();
    });
    $('#back-btn').on('click', function(event) {
      event.preventDefault();
      $('#find-name').val('');
      $('#username-modal').modal('close');
      $('#intro-modal').modal('open');
    });
    $('#submit-fish-name').on('click', function(event) {
      event.preventDefault();
      var tmp = $('#record-name').val().trim();
      if ( tmp !== '') {
        playerName = $('#record-name').val().trim();
        $('#new-fish-modal').modal('close');
        $('#player-pin-name').text(playerName);
        $('#player-pin-level').text(playerLevel);
      }
    });
    $('#find-fish-name').on('click', function(event) {
      event.preventDefault();
      var tmp = $('#find-name').val().trim();
      // needs to check if entered username is in the firebase database
    });
  }

  // Loads player fish onto screen
  function loadPlayer() {
    var tmpName = localStorage.getItem("name");
    var tmpLat = parseInt(localStorage.getItem("latitude"));
    var tmpLong = parseInt(localStorage.getItem("longitude"));
    playerLevel = parseInt(localStorage.getItem("level"));
    showMarkerOnFrontend(tmpLat, tmpLong, tmpName, playerLevel);
    $('#player-pin-name').text(tmpName);
    $('#player-pin-level').text(playerLevel);
    $('#player-pin-lat').text(tmpLat);
    $('#player-pin-lng').text(tmpLong);
    if (playerLevel < 10) {
      $('#player-fish').attr('src', 'assets/images/tuna1.png');
    }
    if (playerLevel >= 10) {
        $('#player-fish').attr('src', 'assets/images/swordfish1.png');
      }
    if (playerLevel >= 20) {
        $('#player-fish').attr('src', 'assets/images/shark.png');
    }
    if (playerLevel >= 30) {
        $('#player-fish').attr('src', 'assets/images/monster.png');
    }
    //center map at the player fish location
    centerMapAtMarker(tmpLat, tmpLong);
  }

  /**
  * Adds a new marker. Saves the marker to the database.
  */
  function addMarker(latitude, longitude, name, level) {
    database.ref('fish/').push({lat: latitude, lng: longitude, name: name, level: level});
  }

  /**
  * Displays a marker on the map, given the marker data. To add a new marker, use the addMarker() function.
  * This function only accounts for getting a marker to display on the frontend, NOT for adding a marker to the database.
  */
  function showMarkerOnFrontend(latitude, longitude, name, level) {
    var markerLocation = {lat: latitude, lng: longitude};
    var marker = new google.maps.Marker({
      position: markerLocation,
      icon: levelImg(level),   
      map: map,     
      customInfo: {name, level}
    });

    // What happens when you click on another fish
    google.maps.event.addDomListener(marker, 'click', function(e) {

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

      // Raises player's level and adjusts their picture appropriately
      playerLevel+=1;
      localStorage.setItem('level', playerLevel);
      $('#player-pin-level').text(playerLevel);
      if (playerLevel >= 10) {
        $('#player-fish').attr('src', 'assets/images/swordfish1.png');
      }
      if (playerLevel >= 20) {
        $('#player-fish').attr('src', 'assets/images/shark.png');
      }
      if (playerLevel >= 30) {
        $('#player-fish').attr('src', 'assets/images/monster.png');
      }
    });

    // Hover over fish markers
    google.maps.event.addDomListener(marker, 'mouseover', function(e) {
      $("#fish-pin-name").text(this.customInfo.name);
      $("#fish-pin-level").text(this.customInfo.level);
      $("#fish-pin-lat").text(parseInt(this.position.lat()));
      $("#fish-pin-lng").text(parseInt(this.position.lng()));
      var weatherReport = openweathermap(this.position.lat(),this.position.lng());      
    });

    // Stop hovering over fish markers
    google.maps.event.addDomListener(marker, 'mouseout', function(e) {
      $("#fish-pin-name").text("");
      $("#fish-pin-level").text("");
      $("#fish-pin-lat").text("");
      $("#fish-pin-lng").text("");
      $('#temp, #sunrise, #sunset, #weather-detail').text("");
    });
  }


  function levelImg(level) {
    if(level<=0)
      return icons.level0.icon;
    else if(level>0 && level<=9)
      return icons.level1.icon;
    else if(level>9 && level<=19)
      return icons.level2.icon;
    else if(level>19 && level<=29)
      return icons.level3.icon;
    else if(level>29)
      return icons.level4.icon;    
  }

  //centers the map at clicked marker. 
  function centerMapAtMarker(lati, long) {
    var latLng = new google.maps.LatLng(lati, long); //Makes a latlng
    map.panTo(latLng); 
    console.log("center map playerFish lat/lng - " + lati + ", " + long);
  }

  //function to remove all data in firebase
  function emptyCPUFish(){
    database.ref('fish/').remove();
  }

  //function to display cpufish randomly on the map. Every 30 seconds 1 fish is displayed
  function generateRandomLatLngCPUFish() {
    counter=1;
    getLatLng();
    setInterval(getLatLng, 30*1000);
  }

  //function to calculate random latitude and longitude for cpuFish
  function getLatLng() {    
    var randomLng = 0, randomLat = 0, data_name="cpuFish", cpuFishLevel = 0;
    data_name = data_name + counter;
    randomLat = generateRandomLatLng(-85, 85, 3);
    randomLng = generateRandomLatLng(-180, 180, 3);      
    addMarker(randomLat, randomLng, data_name, cpuFishLevel);
    counter++;
    console.log("lat - " + randomLat);
    console.log("lng - " + randomLng);   
  }

  //random generator
  function generateRandomLatLng(from, to, fixed) {
    return ( (Math.random() * (to - from) + from).toFixed(fixed) * 1 );
  }

  //function to get weather details based on lat/lng
  function openweathermap(lat, lng) {
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
      $('#temp').text(temp);
      var sunrise = msToTime(response.sys.sunrise) + " AM";
      console.log("sunrise - " + sunrise);
      $('#sunrise').text(sunrise);
      var sunset = msToTime(response.sys.sunset) + " PM";
      console.log("sunset - " + sunset);
      $('#sunset').text(sunset);
      messageToDisplayInHTML = "Weather Details - Main: " + response.weather[0].main + ", Description: " + 
        response.weather[0].description + ", Temperature (F): " + temp + ", Sunrise Time: " + sunrise +
        ", Sunset Time: " + sunset;
      console.log(messageToDisplayInHTML);
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
