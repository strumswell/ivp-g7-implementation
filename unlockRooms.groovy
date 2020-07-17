
def lockedRooms = execution.getVariable("vP_blockierteRaeume")
def city = execution.getVariable("kE_stadtAuswahl")
def hotelid = execution.getVariable("kE_hotelAuswahl")
lockedRooms = lockedRooms.split(',')

for (roomNumber in lockedRooms) {
    // Unlock room
    updateRoomInfo(city+'/'+hotelid+'/rooms/'+roomNumber, '{"status": "free"}')
    println('Unlocked '+roomNumber)
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
