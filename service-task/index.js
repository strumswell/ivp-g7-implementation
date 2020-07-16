/*
* Very weird logic. Just for testing purposes
* https://github.com/camunda/camunda-external-task-client-js
*/
const { Client, Variables, logger } = require('camunda-external-task-client-js');
const config = { baseUrl: 'http://bolte.cloud:8080/engine-rest/', use: logger };
//const config = { baseUrl: 'http://localhost:8080/engine-rest/', use: logger };
const client = new Client(config);
const fs = require('fs')
const invoiceIt = require('@rimiti/invoice-it').default;
const shortid = require('shortid');

client.subscribe('bonitaetPruefen', async function({ task, taskService }) {
    const vorname = task.variables.get('kA_vorname');
    let id = shortid.generate();

    console.log("Incoming: " + vorname);
    let bonitaet = false;
    
    if (vorname == "Jens") {
        console.log("Bonität da!");
        bonitaet = true;
    }

    const camunda_bonitaet = new Variables();
    camunda_bonitaet.set("bP_bonitaet", bonitaet);
    camunda_bonitaet.set("bP_buchungsnummer", id);

    await taskService.complete(task, camunda_bonitaet);
})

client.subscribe('rechnungGenerieren', async function({ task, taskService }) {
    let id = task.variables.get('bP_buchungsnummer')
    invoiceIt.configure({
        global: {
          logo: 'https://i.imgur.com/CkqXDlj.png',
          invoice_reference_pattern: '$separator{BU-' + id + '}',
          invoice_note: 'Alles bezahlt!',
          date_format: 'DD.MM.YYYY',
          lang: 'de'
        },
    });
    
    const recipient = {
        company_name: 'Kunde',
        first_name: task.variables.get('kA_vorname'),
        last_name: task.variables.get('kA_nachname'),
        street_number: '',
        street_name: task.variables.get('kA_strasse') + " " + task.variables.get('kA_hausnummer'),
        zip_code: task.variables.get('kA_plz'),
        city: task.variables.get('kA_ort'),
        country: 'Deutschland',
        phone: '+49 176 88886421',
        mail: task.variables.get('kA_eMail')
    };
     
    const emitter = {
        name: 'Anoroc Reisen GmbH',
        street_number: '',
        street_name: 'Rathenower Landstraße 1',
        zip_code: '14772',
        city: 'Brandenburg',
        country: 'Deutschland',
        phone: '+49 3381 716101',
        mail: 'hey@anoroc.de',
        website: 'anoroc.de'
    };

    let requestedSingleRooms = execution.getVariable("kE_anzEinzelzimmer");
    let requestedDoubleRooms = execution.getVariable("kE_anzDoppelzimmer");
    let requestedSuiteRooms = execution.getVariable("kE_anzSuite");
    let priceSingleRoom = execution.getVariable("vP_preisEinzelzimmer");
    let priceDoubleRoom = execution.getVariable("vP_preisDoppelzimmer");
    let priceSuiteRoom = execution.getVariable("vP_preisSuiten");
    let rooms = [];
    requestedSingleRooms > 0 && rooms.push({description: 'Einzelzimmer', tax: 19, price: priceSingleRoom, qt: requestedSingleRooms});
    requestedDoubleRooms > 0 && rooms.push({description: 'Doppelzimmer', tax: 19, price: priceDoubleRoom, qt: requestedDoubleRooms});
    requestedSuiteRooms > 0 && rooms.push({description: 'Suite', tax: 19, price: priceSuiteRoom, qt: requestedSuiteRooms});
    
    const invoice = invoiceIt.create(recipient, emitter);
    invoice.article = rooms;
    invoice.getInvoice().toPDF().toFile('./invoice_'+id+'.pdf').then(() => {
        console.log('PDF file created.');
    });

    await taskService.complete(task);
})