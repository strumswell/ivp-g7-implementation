import groovy.json.JsonSlurper

// Prepare
def rooms = getServiceReponse('/rooms')
def fittingRooms = [:]
def errorRooms = [:]
def price = 0

enum RoomTypes {
    SINGLE, DOUBLE, SUITE
}

// Look for fitting rooms
for (type in RoomTypes) {
    typeAvailableRooms = getFreeRooms(rooms, type.name().toLowerCase())
    typeAmount = getRoomAmount(type)
    typeResult = []
    if (typeAvailableRooms.size() >= typeAmount) {
        for (i = 0; i < typeAmount; i++) {
            typeResult.add(typeAvailableRooms[i])
            price += typeAvailableRooms[i].get('price')
        }
        fittingRooms[type] = typeResult
    } else {
        fittingRooms[type] = []
        errorRooms[type] = (typeAmount - typeAvailableRooms.size())+" missing"
    }
}

// Output
if (errorRooms.size() == 0) {
    print(fittingRooms) //execution.setVariable("result", fittingRooms)
    print('\n\nGesamtpreis: '+price+' €') //execution.setVariable("price", price)
} else {
    print(errorRooms) //execution.setVariable("error", errorRooms)
}

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
* Get all free rooms of type
* @param rooms array of all rooms from api
* @param type type of room to look for
* @return all free rooms of type
*/
def getFreeRooms(rooms, type) {
    freeRooms = []
    for (roomNumber in rooms) {
        def room = getServiceReponse('/rooms/'+roomNumber)
        if (room.get('status') == 'free') {
            if (room.get('roomtype') == type) {
                room['number'] = roomNumber 
                freeRooms.add(room)
            } 
        }
    }
    return freeRooms
}

/**
* Get requested amount of room type
* @param type room type
* @return number of rooms requested
*/
def getRoomAmount(type) {
    switch (type) {
        case RoomTypes.SINGLE:
            return 1 //execution.getVariable()...
            break
        case RoomTypes.DOUBLE:
            return 2 //execution.getVariable()...
            break
        case RoomTypes.SUITE:
            return 0 //execution.getVariable()...
            break
        default:
            return 0
            break
    }
}