/**
*	Author: Prof. Dr. Jander
*/
let port = 8007;
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Swagger
var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let hotels = {};
for (let h = 1; h <3; ++h){
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
	hotels['b3876198-1a1b-4ddc-9c06-50bc05620d9' + h] = {
		name : 'Anaroc ' + h,
		location : 'Berlin',
		rooms : generatedRooms
	}
}

app.get('/hotels', (req, res) => {
	res.send(Object.keys(hotels));
});

app.get('/hotels/:hotelid', (req, res) => {
	let hotelInfos = hotels[req.params.hotelid];
	delete hotelInfos.rooms;
	res.send(hotelInfos);
});

app.get('/hotels/:hotelid/rooms', (req, res) => {
	res.send(hotels[req.params.hotelid]['rooms']);
});

app.get('/hotels/:hotelid/rooms/:roomid', (req, res) => {
	res.send(hotels[req.params.hotelid]['rooms'][req.params.roomid]);
});

app.put('/hotels/:hotelid/rooms/:roomid', (req, res) => {
	let change = req.body;
	let room = hotels[req.params.hotelid]['rooms'][req.params.roomid];

	switch(change.status) {
		case "free":
			room.guest = "none";
			room.status = "free";
			res.sendStatus(200);
			break;
		case "occupied" && change.guest != undefined:
			room.guest = change.guest;
			room.status = "occupied";
			room.bookedfrom = change.bookedfrom;
			room.bookeduntil = change.bookeduntil;
			res.sendStatus(200);
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

let server = app.listen(port, function () {
	let host = server.address().address;
	let port = server.address().port;
	console.log("Webserver running at http://%s:%s", host, port);
})