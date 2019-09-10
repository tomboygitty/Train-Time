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

$("#add-train").on("click", function() {
    event.preventDefault();

    name = $("#name-input").val().trim();
    dest = $("#dest-input").val().trim();
    first = $("#time-input").val().trim();
    freq = $("#freq-input").val().trim();
    
    mins = calcMins(first, freq);

    // Next Train
    next = moment(moment().add(mins, "minutes")).format("HH:mm A");
    //console.log("ARRIVAL TIME: " + next);
    

    if ((name!="")&&(dest!="")&&(first!="")&&(freq!="")&&(moment(first, 'HH:mm', true).isValid())) {
        database.ref().push({
            name: name,
            destination: dest,
            firstTime: first,
            frequency: freq,
            nextArrival: next,
            minsAway: mins,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
    }
    else{
        alert("Please make sure all inputs are complete and formatted correctly.");
    }

});

database.ref().on("child_added", function(snapshot) {
    var sv = snapshot.val();

    var tableItem = $("<tr>");
    var tableName = $("<td>");
    var tableDest = $("<td>");
    var tableFreq = $("<td>");
    var tableNext = $("<td>");
    tableNext.attr("id", "next" + sv.name);
    var tableMins = $("<td>");
    tableMins.attr("id", "mins" + sv.name);
    console.log(tableNext.attr("id") + ", " + tableMins.attr("id"));
    
    
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

function calcMins(start, freq) {
    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(start, "HH:mm").subtract(1, "years");

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

    // Time apart (remainder)
    var tRemainder = diffTime % freq;

    // Minutes Until Train
    return mins = freq - tRemainder;
}

function updateTimes() {
    var query = firebase.database().ref().orderByKey();
    query.once("value")
    .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
        // childData will be the actual contents of the child
        var childData = childSnapshot.val();
        var childFirst = childData.firstTime;
        var childFreq = childData.frequency;
        var childMins = calcMins(childFirst, childFreq);
        var childNext = moment(moment().add(childMins, "minutes")).format("HH:mm A");
        var nextID = "#next" + childData.name;
        var minsID = "#mins" + childData.name;
        $(nextID).text(childNext);
        $(minsID).text(childMins);
        console.log(childFirst);
        console.log(childFreq);
        console.log(childNext);
        console.log(childMins);
        });
    });
}

updateTimes();