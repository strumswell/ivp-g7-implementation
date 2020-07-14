import groovy.json.JsonSlurper

// Prepare
def rooms = getServiceReponse('/rooms')
def availableRoomsByType = [:]
def fittingRooms = []
def errorRooms = [:]
def price = 0

// Input
def guests = execution.getVariable("kE_anzPersonen")
def arrival = Date.parse("dd.mm.yyyy", execution.getVariable("kE_anreisedatum"))
def depart = Date.parse("dd.mm.yyyy", execution.getVariable("kE_abreisedatum"))
def nights = depart - arrival

enum RoomTypes {
    SINGLE, DOUBLE, SUITE
}

// Look for fitting rooms
for (type in RoomTypes) {
    // Get all free rooms by type
    typeAvailableRooms = getFreeRooms(rooms, type.name().toLowerCase())
    // Let's save them for later
    availableRoomsByType[type] = typeAvailableRooms
    // Ok, how many do we need from this type
    typeAmount = getRequestedRoomAmount(type)
    if (typeAvailableRooms.size() >= typeAmount) {
        for (i = 0; i < typeAmount; i++) {
            fittingRooms.add(typeAvailableRooms[i].get('number'))
            price += nights * typeAvailableRooms[i].get('price')
        }
    } else {
        errorRooms[type] = (typeAmount - typeAvailableRooms.size())
    }
}

// Output
if (errorRooms.size() == 0) {
    def priceSingle = (availableRoomsByType[RoomTypes.SINGLE][0] != null) ? availableRoomsByType[RoomTypes.SINGLE][0]['price'] : 0
    def priceDouble = (availableRoomsByType[RoomTypes.DOUBLE][0] != null) ? availableRoomsByType[RoomTypes.DOUBLE][0]['price'] : 0
    def priceSuite = (availableRoomsByType[RoomTypes.SUITE][0] != null) ? availableRoomsByType[RoomTypes.SUITE][0]['price'] : 0

    execution.setVariable("vP_verfuegbarkeit", true)
    execution.setVariable("vP_preisEinzelzimmer", priceSingle)
    execution.setVariable("vP_preisDoppelzimmer", priceDouble)
    execution.setVariable("vP_preisSuiten", priceSuite)
    execution.setVariable("vP_preisReiseGesamt", price)
    execution.setVariable("vP_blockierteRäume", fittingRooms.join(","))
} else {
    def missingSingle = (errorRooms[RoomTypes.SINGLE] != null) ? errorRooms[RoomTypes.SINGLE] : 0
    def missingDouble = (errorRooms[RoomTypes.DOUBLE] != null) ? errorRooms[RoomTypes.DOUBLE] : 0
    def missingSuite = (errorRooms[RoomTypes.SUITE] != null) ? errorRooms[RoomTypes.SUITE] : 0
   
    execution.setVariable("vP_verfuegbarkeit", false)
    execution.setVariable("vP_anzFehlenderEinzelzimmer", missingSingle)
    execution.setVariable("vP_anzFehlenderDoppelzimmerzimmer", missingDouble)
    execution.setVariable("vP_anzFehlenderSuiten", missingSuite)
}

/**
* Make a call to the rooms service api.
* @param route the route to call
* @return the response of the service api
*/
def getServiceReponse(route) {
    def connection = new URL('http://implproz.cbu.net:8007/hotels/berlin'+route).openConnection();
    def response = '';
    if(connection.getResponseCode().equals(200)) {
        response = connection.getInputStream().getText();
    }
    return new JsonSlurper().parseText(response);
} 

// TODO: Include a date check! Might have to adjust API
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
def getRequestedRoomAmount(type) {
    switch (type) {
        case RoomTypes.SINGLE:
            return execution.getVariable("kE_anzEinzelzimmer")
            break
        case RoomTypes.DOUBLE:
            return execution.getVariable("kE_anzDoppelzimmer")
            break
        case RoomTypes.SUITE:
            return execution.getVariable("kE_anzSuite")
            break
        default:
            return 0
            break
    }
}