def lockedRooms = execution.getVariable("vP_blockierteRaeume")
def city = execution.getVariable("kE_stadtAuswahl")
def hotelid = execution.getVariable("kE_hotelAuswahl")
def firstname = execution.getVariable("kA_vorname")
def lastname = execution.getVariable("kA_nachname")
def arrival = Date.parse("dd.MM.yyyy", execution.getVariable("kE_anreisedatum"))
def depart = Date.parse("dd.MM.yyyy", execution.getVariable("kE_abreisedatum"))
def bookingnr = execution.getVariable("bP_buchungsnummer")
lockedRooms = lockedRooms.split(',')

for (roomNumber in lockedRooms) {
    // Book room
    updateRoomInfo(city+'/'+hotelid+'/rooms/'+roomNumber, '{"status": "occupied", "guest": "'+firstname+' '+lastname+'" ,"bookedfrom": "'+arrival.getDateString()+'", "bookeduntil": "'+depart.getDateString()+'", "bookingnr": "'+bookingnr+'"}')
    println('Booked '+roomNumber)
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
