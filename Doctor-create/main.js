var express = require('express');
var app = express();
var Model = require('./models/user');
var util=require('util');
app.use(express.static('public'));
var server = app.listen(7084, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})
app.get('/', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})


var io=require('socket.io').listen(server);







io.sockets.on('connection',function(socket){
		
	socket.on('send doctor',function(data){
		var MongoClient = require('mongodb').MongoClient;					
		var url = "mongodb://localhost:27017/doctor";
		MongoClient.connect(url, function(err, db) {		
			if (err) throw err;
			var myobj = new Model({	
			ContractAddress: data.ca,
			firstName: data.firstName,
            SSN:data.SSN,
			phoneNumber:data.phoneNumber,
			email:data.email,
			specialty1:data.specialty1,
			address1:data.address1,
			currentStatus:data.currentStatus
		});
			db.collection("ad").insertOne(myobj, function(err, res) {
			if (err) throw err;
			console.log("1 document inserted");
			db.close();
			});
		});
		
		  	
	});	
	
});







