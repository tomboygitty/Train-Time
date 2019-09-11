var config = {
    apiKey: "AIzaSyBlpE7mXkjoF9BnzhJb-L8UrRK1FquLF7c",
    authDomain: "train-time-d900f.firebaseapp.com",
    databaseURL: "https://train-time-d900f.firebaseio.com",
    storageBucket: "train-time-d900f.appspot.com",
  };

firebase.initializeApp(config);

// Create a variable to reference the database.
 var database = firebase.database();

// Initial Values
var name = "";
var dest = "";
var first = "";
var freq = "";
var next = "";
var mins = 0;
var trains = [];

$("#add-train").on("click", function() {
    event.preventDefault();

    name = $("#name-input").val().trim();
    dest = $("#dest-input").val().trim();
    first = $("#time-input").val().trim();
    freq = $("#freq-input").val().trim();
    
    // Calculate minutes to next arrival
    mins = calcMins(first, freq);

    // Calculate next train arrival time
    next = moment(moment().add(mins, "minutes")).format("HH:mm A");
    
    // Check if this train name has already been used
    if (checkName(name)) {
        // Validate all input fields
        if ((name!="")&&(dest!="")&&(first!="")&&(freq!="")&&(moment(first, 'HH:mm', true).isValid())) {
            database.ref().push({
                name: name,
                destination: dest,
                firstTime: first,
                frequency: freq,
                dateAdded: firebase.database.ServerValue.TIMESTAMP
            });
        }
        else {
            alert("Please make sure all inputs are complete and formatted correctly.");
        }
    }
    else {
        alert("This name is already in use. Please use another.");
    }

});

// Every time an entry is added to the database, update the data table to display it
database.ref().on("child_added", function(snapshot) {
    var sv = snapshot.val();

    var tableItem = $("<tr>");
    var tableName = $("<td>");
    var tableDest = $("<td>");
    var tableFreq = $("<td>");
    var tableNext = $("<td>");
    tableNext.attr("id", "next" + sv.name.replace(/\s+/g, ''));
    var tableMins = $("<td>");
    tableMins.attr("id", "mins" + sv.name.replace(/\s+/g, ''));
    
    tableName.text(sv.name);
    tableDest.text(sv.destination);
    tableFreq.text(sv.frequency);
    tableNext.text(sv.nextArrival);
    tableMins.text(sv.minsAway);

    tableItem.append(tableName);
    tableItem.append(tableDest);
    tableItem.append(tableFreq);
    tableItem.append(tableNext);
    tableItem.append(tableMins);

    $("#table-body").append(tableItem);

}, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

// Function to check if a train name is already stored in the database
function checkName(str) {
    for (var i=0; i < trains.length; i++) {
        if (trains[i]===str) {
            return false;
        }
    }
    return true;
};

// Function that takes start time and frequency and returns number of minutes from current moment to next arrival
function calcMins(start, freq) {
    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(start, "HH:mm").subtract(1, "years");

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

    // Time apart (remainder)
    var tRemainder = diffTime % freq;

    // Minutes Until Train
    return mins = freq - tRemainder;
};

// Function to update the next arrival and minutes remaining for all trains in the database and initialize train names array
// (Called whenever page loads)
function initialize() {
    var query = firebase.database().ref().orderByKey();
    query.once("value")
    .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            // childData will be the actual contents of the child
            var childData = childSnapshot.val();
            // Store train name of current child and remove all spaces
            var childName = childData.name.replace(/\s+/g, '');
            // Store this simplified name into the names array
            trains.push(childName);
            var childFirst = childData.firstTime;
            var childFreq = childData.frequency;
            var childMins = calcMins(childFirst, childFreq);
            var childNext = moment(moment().add(childMins, "minutes")).format("HH:mm A");
            var nextID = "#next" + childName;
            var minsID = "#mins" + childName;
            // Update the current display to show next arrival time and minutes remaining for current train
            $(nextID).text(childNext);
            $(minsID).text(childMins);
        });
    });
};

initialize();