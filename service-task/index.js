/*
* https://github.com/camunda/camunda-external-task-client-js
*/
require('dotenv').config()
const { Client, Variables, logger } = require('camunda-external-task-client-js');
const config = { baseUrl: 'http://bolte.cloud:8080/engine-rest', use: logger };
//const config = { baseUrl: 'http://localhost:8080/engine-rest/', use: logger };
const client = new Client(config);
const fs = require('fs')
const invoiceIt = require('@rimiti/invoice-it').default;
const shortid = require('shortid');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PW
    }
});

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
    let id = task.variables.get('bP_buchungsnummer');
    invoiceIt.configure({
        global: {
          logo: 'https://i.imgur.com/CkqXDlj.png',
          invoice_reference_pattern: '$separator{' + id + '}',
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
        mail: 'anoroc@bolte.cloud',
        website: 'anoroc.de'
    };

    let requestedSingleRooms = Number(task.variables.get("kE_anzEinzelzimmer"));
    let requestedDoubleRooms = Number(task.variables.get("kE_anzDoppelzimmer"));
    let requestedSuiteRooms = Number(task.variables.get("kE_anzSuite"));
    let priceSingleRoom = Number(task.variables.get("vP_preisEinzelzimmer"));
    let priceDoubleRoom = Number(task.variables.get("vP_preisDoppelzimmer"));
    let priceSuiteRoom = Number(task.variables.get("vP_preisSuiten"));

    const dayLength = 1000 * 60 * 60 * 24;
    let arrivalString = (task.variables.get("kE_anreisedatum")).split('.').map(Number);
    let departString = (task.variables.get("kE_abreisedatum")).split('.').map(Number);
    let arrivalDate = new Date(arrivalString[2],arrivalString[1]-1,arrivalString[0]);
    let departDate = new Date(departString[2],departString[1]-1,departString[0]);
    let nights = Math.round((departDate - arrivalDate) / dayLength);

    let rooms = [];
    requestedSingleRooms > 0 && rooms.push({description: 'Einzelzimmer', tax: 19, price: priceSingleRoom*nights, qt: requestedSingleRooms});
    requestedDoubleRooms > 0 && rooms.push({description: 'Doppelzimmer', tax: 19, price: priceDoubleRoom*nights, qt: requestedDoubleRooms});
    requestedSuiteRooms > 0 && rooms.push({description: 'Suite', tax: 19, price: priceSuiteRoom*nights, qt: requestedSuiteRooms});

    const invoice = invoiceIt.create(recipient, emitter);
    invoice.article = rooms;
    invoice.getInvoice().toPDF().toFile('./invoice_'+id+'.pdf').then(() => {
        console.log('PDF file created.');
        const mailOptions = {
            from: 'Reisebüro Anoroc <infodsp.bot@gmail.com>',
            to: task.variables.get('kA_eMail'),
            cc: 'anoroc@bolte.cloud',
            subject: 'Ihre Rechnung',
            text: 'Anbei Ihre Rechnung!',
            attachments: [{
                filename: 'invoice_'+id+'.pdf',
                path: './invoice_'+id+'.pdf',
                contentType: 'application/pdf'
            }],
        };
    
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    });

    await taskService.complete(task);
})