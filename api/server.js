/**
*	Author: 
*     - Prof. Dr. Jander
*     - Jonas Teubner
*     - Philipp Bolte
*/
let port = 8007;
let express = require('express');
var cors = require('cors');
let app = express();
let bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Swagger
var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// generiere Hotels
let staedte = ["Berlin", "Hamburg"];
let hotels = {"Berlin": {}, "Hamburg": {}};
staedte.forEach(stadt => {
	for (let h = 1; h < 3; ++h){
		// generiere Räume für Hotels
		let generatedRooms = {};
		for (let i = 100; i < 120; ++i) {
			generatedRooms[i] = {
				roomtype : "single",
				price : 80,
				guest : "none",
				status : "free",
				bookedfrom : "",
				bookeduntil : ""
			}
		}
		for (let i = 200; i < 210; ++i) {
			generatedRooms[i] = {
				roomtype : "double",
				price : 120,
				guest : "none",
				status : "free",
				bookedfrom : "",
				bookeduntil : ""
			}
		}
		for (let i = 300; i < 305; ++i) {
			generatedRooms[i] = {
				roomtype : "suite",
				price : 250,
				guest : "none",
				status : "free",
				bookedfrom : "",
				bookeduntil : ""
			}
		}
		
		hotels[stadt]['b3876198-1a1b-4ddc-9c06-50bc05620d' + h + stadt.charAt(0).toLowerCase()] = {
			name : 'Anaroc ' + stadt + " " + h, 
			location : stadt,
			rooms : generatedRooms
		}
	}
});

// console.log(hotels["Hamburg"])
// hotels/:stadt -> Alle Hotels zurückgeben
// hotels/:stadt/:hotelid -> Spezifisches Hotels aus der Stadt
// hotels/:stadt/:hotelid/rooms -> Räume aus spezifisches Hotels aus der Stadt
// hotels/:stadt/:hotelid/rooms/:roomid -> Räume aus spezifisches Hotels aus der Stadt
/**
hotels = {
	Berlin : {
		uuid1: {
	
		}, 
		uuid2: {
	
		}
	},
	Hamburg : {
		uuid1: {
	
		}, 
		uuid2: {
	
		}
	}
}
*/

// Alle Städte abfrage
app.get('/hotels/cities', (req, res) => {
	res.send(Object.keys(hotels));
});

// Alle Hotels in einer Städte abfragen
app.get('/hotels/:stadt', (req, res) => {
	// Deep clone object
	let hotelInfos = JSON.parse(JSON.stringify(hotels[req.params.stadt]));
	// Remove rooms
	Object.keys(hotelInfos).forEach(hotelID => {
		delete hotelInfos[hotelID].rooms;
	});
	res.send(hotelInfos);
});

// Ein sepzifisches Hotel in einer bestimmten Stadt abfragen
app.get('/hotels/:stadt/:hotelid', (req, res) => {
	// Deep clone object
	let hotelInfos = JSON.parse(JSON.stringify(hotels[req.params.stadt][req.params.hotelid]));
	// Remove rooms
	delete hotelInfos.rooms;
	res.send(hotelInfos);
});

// Alle Räume eines Hotels abfragen
app.get('/hotels/:stadt/:hotelid/rooms', (req, res) => {
	res.send(hotels[req.params.stadt][req.params.hotelid]['rooms']);
});

// Spezifischen Raum abfragen
app.get('/hotels/:stadt/:hotelid/rooms/:roomid', (req, res) => {
	res.send(hotels[req.params.stadt][req.params.hotelid]['rooms'][req.params.roomid]);
});

// Attribute eines spezifischen Raums updaten
app.put('/hotels/:stadt/:hotelid/rooms/:roomid', (req, res) => {
	let change = req.body;
	let room = hotels[req.params.stadt][req.params.hotelid]['rooms'][req.params.roomid];
	switch(change.status) {
		case "free":
			room.guest = "none";
			room.status = "free";
			room.bookedfrom = "";
			room.bookeduntil = "";
			res.sendStatus(200);
			break;
		case "occupied":
			if (change.guest != undefined) {
				room.guest = change.guest;
				room.status = "occupied";
				room.bookedfrom = change.bookedfrom;
				room.bookeduntil = change.bookeduntil;
				res.sendStatus(200);
				break;
			}
			res.sendStatus(400);
			break;
		case "locked":
			room.status = "locked";
			room.bookedfrom = change.bookedfrom;
			room.bookeduntil = change.bookeduntil;
			res.sendStatus(200);
			break;
		default:
			res.sendStatus(400);
			return;
	}
});

app.get('/debug', (req, res) => {
	res.send(hotels);
});

app.get('/debug/:stadt', (req, res) => {
	res.send(hotels[req.params.stadt]);
});

let server = app.listen(port, function () {
	let host = server.address().address;
	let port = server.address().port;
	console.log("Webserver running at http://%s:%s", host, port);
})