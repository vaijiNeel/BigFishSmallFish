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
    for (var i = 0; i < 50; i++) {
      getLatLng();
    }    
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
  var timerOn=false, counter=1;
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
      saveAddedMarker(latitude, longitude, myName, 1);
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
      t = setInterval(getLatLng, 1000);
      getLatLng();
    }    
  }

  function getLatLng() {    
    var randonLng = 0, randomLat = 0, data_name="cpuFish", cpuFishLevel = 0;
    //get random lat/lng
    data_name = data_name + counter;
    randomLat = generateRandomLatLng(85, -85, 3);
    randomLng = generateRandomLatLng(180, -180, 3); 
    console.log("lat - " + randomLat);
    console.log("lng - " + randomLng);
    //-------------------testing------------
    datasnapshot = new DataSnapshot(database);

  //  database rootRef = FirebaseDatabase.getInstance().getReference();
    // rootRef.addListenerForSingleValueEvent(new ValueEventListener() {
    //   // @Override
    //   void onDataChange(DataSnapshot snapshot) {
    //     if (snapshot.hasChild("name")) 
    //       console.log("Name already exists.");
    //     else
    //       console.log("Name doesn't exist.");
    //   }
    // });
    // var nameToCheck = "cpuFish1";
    // var nameRef = new firebase(name);
    // nameRef.child(name).once('value', function(snapshot) {
    //   var exists = (snapshot.val() !== null);
    //   if(exists)
    //     console.log("Name already exists.");
    //   else
    //     console.log("Name doesn't exist.");
    // });

    //---------------testing-----------
    saveAddedMarker(randomLat, randomLng, data_name, cpuFishLevel);
    counter++;
  }

  function generateRandomLatLng(to, from, fixed) {
    return ( (Math.random() * (to - from) + from).toFixed(fixed) * 1 );
  }
