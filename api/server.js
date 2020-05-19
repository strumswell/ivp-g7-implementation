/**
*	Author: Prof. Dr. Jander
*/
let port = 8007;
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let rooms = {};
for (let i = 100; i < 120; ++i) {
	rooms[i] = {
		roomtype : "single",
		price : 80,
		guest : "none",
		status : "free"
	}
}
for (let i = 200; i < 210; ++i) {
	rooms[i] = {
		roomtype : "double",
		price : 120,
		guest : "none",
		status : "free"
	}
}
for (let i = 300; i < 305; ++i) {
	rooms[i] = {
		roomtype : "suite",
		price : 250,
		guest : "none",
		status : "free"
	}
}


app.get('/hotels/berlin/rooms', (req, res) => {
	res.send(Object.keys(rooms));
});

app.get('/hotels/berlin/rooms/:roomid', (req, res) => {
	res.send(rooms[req.params.roomid]);
});

app.put('/hotels/berlin/rooms/:roomid', (req, res) => {
	let change = req.body;
	if (change.status === "free") {
		rooms[req.params.roomid].guest = "none";
		rooms[req.params.roomid].status = "free";
	}
	else if (change.status === "occupied" && change.guest != undefined) {
		rooms[req.params.roomid].guest = change.guest;
		rooms[req.params.roomid].status = "occupied";
	}
	else {
		res.sendStatus(400);
		return;
	}
	res.sendStatus(200);
});


let server = app.listen(port, function () {
	let host = server.address().address;
	let port = server.address().port;
	console.log("Webserver running at http://%s:%s", host, port);
})
