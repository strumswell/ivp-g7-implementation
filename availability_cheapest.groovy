import groovy.json.JsonSlurper

// User Input
def singleAmount = 2
def doubleAmount = 2
def suiteAmount = 0
def nights = 0
def guests = 0

// Prepare
def rooms = getServiceReponse('/rooms')
def fittingRooms = [] // rooms to return to user
def price = 0

types = ['single', 'double', 'suite']
for (type in types) {
    typeRooms = getFreeRooms(rooms, type)
    typeAmount = getAmount(type)
    if (typeRooms.length >= typeAmount) {
        for (i = 0, i < typeAmount, i++) {
            fittingRooms.add(typeRooms[i])
        }
    } else { // Wenn wir Wünsche nicht erfüllen können, dann schmeißen wir die aus dem Fenster raus und bauen das billigste Angebot
        fittingRooms.clear()
        // fittingRooms = getCheapestOptions()
        possibleDoubleAmount = math.floor(guests / 2)  
        guestsLeftOver = guests % 2
        doubleRooms = getFreeRooms(rooms, 'double')
        if (typeRooms.length >= typeAmount) {
            for (i = 0, i < possibleDoubleAmount, i++) {
                fittingRooms.add(doubleRooms[i])
        }
        if (guestsLeftOver == 1) {
            singleRooms = getFreeRooms(rooms, 'single')
            fittingRooms.add(singleRooms[0])
        } 
        break
    }
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

/**
* TODO
*/
def getFreeRooms(rooms, type) {
    freeRooms = []
    for (roomNumber in rooms) {
        def room = getServiceReponse('/rooms/'+roomNumber)
        if (room.get('status') == 'free') {
            if (room.get('roomtype') == type) {
                room['number'] = roomNumber // add room number to room info
                freeRooms.add(room)
            } 
        }
    }
    return freeRooms
}

// suiteAmount, singleAmount, doubleAmount
def getAmount(type) {
    return execution.getVariable(type+'Amount')
}