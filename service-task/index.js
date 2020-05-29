/*
* Very weird logic. Just for testing purposes
* https://github.com/camunda/camunda-external-task-client-js
*/
const { Client, Variables, logger } = require('camunda-external-task-client-js');
const config = { baseUrl: 'http://bolte.cloud:8080/engine-rest/', use: logger };
const client = new Client(config);

client.subscribe('bonitaetPruefen', async function({ task, taskService }) {
    const vorname = task.variables.get('kA_vorname');
    const name = task.variables.get('kA_nachname');
    const mail = task.variables.get('kA_eMail');
    console.log("Incoming: " + vorname + " " + name + " - " + mail);
    let bonitaet = false;
    
    // if last char of IBAN is smaller 6 
    if (vorname == "Jens") {
        console.log("Bonität da!");
        bonitaet = true;
    }

    const camunda_bonitaet = new Variables();
    camunda_bonitaet.set("bonitaet", bonitaet);

    await taskService.complete(task, camunda_bonitaet);
})

client.subscribe('rechnungGenerieren', async function({ task, taskService }) {
    await taskService.complete(task);
})