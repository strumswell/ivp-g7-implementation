import groovy.json.JsonSlurper

// User Input
def singleAmount = 0
def doubleAmount = 0
def suiteAmount = 0
def nights = 0
def guests = 0

// Prepare
def rooms = getServiceReponse('/rooms')
def singleRooms = []
def doubleRooms = []
def suiteRooms = []
def fittingRooms = [] // rooms to return to user
def price = 0

// Super ugly.... find a better way
// 1. Build array of all available rooms 2. Try to find users wishes
for (roomNumber in rooms) {
    def room = getServiceReponse('/rooms/'+roomNumber)
    if (room.get('status') == 'free') {
        room['number'] = roomNumber // add room number to room info
        if (room.get('roomtype') == 'single') {
            if (singleAmount > 0) {
                fittingRooms.add(room)
                price += room.get('price')
                singleAmount--
                guests--
            } else {
                singleRooms.add(room)
            }
        } else if (room.get('roomtype') == 'double') {
            if (doubleAmount > 0) {
                fittingRooms.add(room)
                price += room.get('price')
                doubleAmount--
                guests -= 2
            } else {
                doubleRooms.add(room)
            }
        } else if (room.get('roomtype') == 'suite') {
            if (singleAmount > 0) {
                suiteAmount.add(room)
                price += room.get('price')
                suiteAmount--
                guests -= 3
            } else {
                suiteRooms.add(room)
            }
        }
    }
}

// We do everything on our own...
if (guests == 1) {
    if (singleRooms.length > 0) {
        fittingRooms.add(singleRooms[0])
        guests = 0
    } else if (doubleRooms.length > 0) {
        fittingRooms.add(doubleRooms[0])
        guests = 0
    } else if (suiteRooms.length > 0) {
        fittingRooms.add(suiteRooms[0])
        guests = 0
    } else {
        fittingRooms.clear() // gibts das?
        fittingRooms.add('Error: Es gibt keine freie Raumkombination.')
    }
} else {
    // ... more than two people 
}


print(fittingRooms) // [[number:100, price:80, ...], [number:101, price:80, ...], ...]

/* Set vars for Camunda BPM
execution.setVariable("number", fittingRooms[0]['number'])
execution.setVariable("roomtype", fittingRooms[0]['roomtype'])
execution.setVariable("price", fittingRooms[0]['price'])
execution.setVariable("status", fittingRooms[0]['status'])
*/

/**
* Make a call to the rooms service api.
* @param route the route to call
* @return the response of the service api
*/
def getServiceReponse(route) {
    def connection = new URL('http://implproz.biz.tm:8007/hotels/berlin'+route).openConnection();
    def response = '';
    if(connection.getResponseCode().equals(200)) {
        response = connection.getInputStream().getText();
    }
    return new JsonSlurper().parseText(response);
} 