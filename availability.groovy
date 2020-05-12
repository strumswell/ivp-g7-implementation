import groovy.json.JsonSlurper

def rooms = getServiceReponse('/rooms')
def fittingRooms = [] // list for all rooms fullfilling the conditions

// go through all rooms...
for (roomNumber in rooms) {
    def room = getServiceReponse('/rooms/'+roomNumber)
    // is room cheaper than 100?
    if (room.get('price') < 100) {
        room['number'] = roomNumber // add room number to room info
        fittingRooms.add(room) 
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