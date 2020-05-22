/*
* Very weird logic. Just for testing purposes
* https://github.com/camunda/camunda-external-task-client-js
*/
const { Client, Variables, logger } = require('camunda-external-task-client-js');
const config = { baseUrl: 'http://bolte.cloud:8080/engine-rest/', use: logger };
const client = new Client(config);

client.subscribe('bonitaet', async function({ task, taskService }) {
    const vorname = task.variables.get('FormField_191imfb');
    const name = task.variables.get('FormField_0hrk5hs');
    const iban = task.variables.get('FormField_2n4p8ss');
    console.log("Incoming: " + vorname + " " + name + " - " + iban);
    let bonitaet = false;
    
    // if last char of IBAN is smaller 6 
    if (parseInt(iban.slice(-1)) < 6) {
        console.log("Bonität da!");
        bonitaet = true;
    }

    console.log("Bonität:" + bonitaet)
    const camunda_bonitaet = new Variables();
    camunda_bonitaet.set("bonitaet", bonitaet);

    await taskService.complete(task, camunda_bonitaet);
})

/*  Output of tests
*   ===========================================================
*   ✓ subscribed to topic bonitaet
*   Incoming: Klaus Kleber - DE26500105178418388875
*   Bonität da!
*   Bonität:true
*   ✓ completed task d37a1d7f-9c30-11ea-8ee0-87af75601f00
*   Incoming: Klaus Kleber - DE26500105178418388876
*   Bonität:false
*   ✓ completed task b2f2843b-9c31-11ea-8ee0-87af75601f00
*/