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
    
    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConverted = moment(first, "HH:mm").subtract(1, "years");
    console.log(firstTimeConverted);

    // Current Time
    var currentTime = moment();
    console.log("CURRENT TIME: " + moment(currentTime).format("HH:mm"));

    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    console.log("DIFFERENCE IN TIME: " + diffTime);

    // Time apart (remainder)
    var tRemainder = diffTime % freq;
    console.log(tRemainder);

    // Minutes Until Train
    mins = freq - tRemainder;
    console.log("MINUTES TILL TRAIN: " + mins);

    // Next Train
    next = moment().add(mins, "minutes");
    console.log("ARRIVAL TIME: " + moment(next).format("HH:mm"));
    

    if ((name!="")&&(dest!="")&&(first!="")&&(freq!="")&&(moment(first, 'HH:mm', true).isValid())) {
        database.ref().push({
            name: name,
            destination: dest,
            firstTime: first,
            frequency: freq,
            nextArrival: mins,
            minsAway: next,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
    }
    else{
        alert("Please make sure all inputs are complete and formatted correctly.");
    }

});

database.ref().on("child_added", function(snapshot) {
    var sv = snapshot.val();

    // console.log(sv.name);
    // console.log(sv.role);
    // console.log(sv.date);
    // console.log(sv.monthsWorked);
    // console.log(sv.rate);
    // console.log(sv.totalBilled);

    var tableItem = $("<tr>");
    var tableName = $("<td>");
    var tableDest = $("<td>");
    var tableFreq = $("<td>");
    var tableNext = $("<td>");
    var tableMins = $("<td>");

    
    
    tableName.text(sv.name);
    tableDest.text(sv.destination);
    tableFreq.text(sv.frequency);
    tableNext.text(sv.nextArrival);
    tableMins.text(sv.minsAway);

    tableItem.append(tableName);
    tableItem.append(tableRole);
    tableItem.append(tableDate);
    tableItem.append(tableWorked);
    tableItem.append(tableRate);

    $("#table-body").append(tableItem);

}, function(errorObject) {
  console.log("Errors handled: " + errorObject.code);
});