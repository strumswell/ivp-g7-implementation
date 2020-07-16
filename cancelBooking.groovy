import groovy.json.JsonSlurper

def bookingnr = "asdfghjkl"//execution.getVariable("sE_Buchungsnummer")
def bookedRooms = getServiceReponse('booking/'+bookingnr)

bookedRooms.each { stadt, hotelids -> 
    hotelids.each { hotelid, allRooms ->
        allRooms.rooms.each { roomID ->
            updateRoomInfo(stadt+"/"+hotelid+"/rooms/"+roomID, '{"status": "free"}')
            println("Cancelled " + hotelid + " " + roomID)
        }
    }
}

/**
* Change a room's infos
* @param route the route to call
* @param data json of data to change
*/
def updateRoomInfo(route, data) {
    def connection = new URL('http://implproz.cbu.net:8007/hotels/'+route).openConnection();
    connection.setRequestMethod("PUT")
    connection.setDoOutput(true)
    connection.setRequestProperty("Content-Type", "application/json")
    connection.getOutputStream().write(data.getBytes("UTF-8"))
    if(connection.getResponseCode().equals(200)) {
        println(connection.getInputStream().getText())
    }
    return
}

/**
* Make a call to the rooms service api.
* @param route the route to call
* @return the response of the service api
*/
def getServiceReponse(route) {
    def connection = new URL('http://implproz.cbu.net:8007/'+route).openConnection();
    def response = '';
    if(connection.getResponseCode().equals(200)) {
        response = connection.getInputStream().getText()
    }
    return new JsonSlurper().parseText(response)
} 
