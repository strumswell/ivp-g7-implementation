import groovy.json.JsonSlurper

def rooms = getServiceReponse('/rooms')
def fittingRooms = [] // list for all rooms fullfilling the conditions

// go through all rooms...
for (roomNumber in rooms) {
    def room = getServiceReponse('/rooms/'+roomNumber)
    print(room)
    // Get all free rooms in their category
    // def freeEinzelRooms = []
    // def freeDoppelRoom = []
    // def freeSuitRoom = []
    // if status = free
    //      if roomtype = single
    //          room['number'] = roomNuber
    //          freeEinzelRooms.add(room)
    //      if roomtype = double
    //          room['number'] = roomNuber
    //          freeDoppelRooms.add(room)
    //      if roomtype = suite
    //          room['number'] = roomNuber
    //          freeSuiteRooms.add(room)
    if (room.get('price') < 100) {
        room['number'] = roomNumber // add room number to room info
        fittingRooms.add(room) 
    } 

    //execution.setVariable("number", fittingRooms[0]['number']+", "+fittingRooms[1]['number'])
    // number: 100
    // number: "100, 202, 310"
    // type: "single, double, suite"
    // price: "80€ + 120€ + 300€ = 500€"


    // Ende:
    // return Dopplezimmer, Einzelzimmer
    // Camunda Modeler (festes) Form: 
    // - Raumnummer: DefaultValue: ${number} 
    // - Typ: DefaultValue: ${roomtype} 
    // - Preis: DefaultValue: ${price} 
    //
    // Generated Form:
    // Array mit Räumen (rooms)
    // <html>
    // <script>
    //  for room in rooms {
    //      Generiere das einzelne Form
    //      ODER
    //      Generiere Tabelle mit Buttons
    //  }
    // </script>
    // <form>
    //  <input>...
    //  <button>...
    // </form>
    // </html>


    // Irgendein anderes Skript:
    // Input: number ("100, 202, 310")
    // Verarbeitung: rooms = number.split(",");
    //                 -> ["100", "202", "310"]
}


//print(fittingRooms) // [[number:100, price:80, ...], [number:101, price:80, ...], ...]

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