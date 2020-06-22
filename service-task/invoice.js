const fs = require('fs')
const invoiceIt = require('@rimiti/invoice-it').default;
const shortid = require('shortid');

invoiceIt.configure({
    global: {
      logo: 'https://i.imgur.com/CkqXDlj.png',
      invoice_reference_pattern: '$separator{BU-' + shortid.generate() + '}',
      invoice_note: 'Alles bezahlt!',
      date_format: 'DD.MM.YYYY',
      lang: 'de'
    },
});

const recipient = {
    company_name: 'Kunde',
    first_name: 'Philipp',
    last_name: 'Bolte',
    street_number: '',
    street_name: 'Petersweg 16',
    zip_code: '14770',
    city: 'Brandenburg',
    country: 'Deutschland',
    phone: '+49 176 88886421',
    mail: 'spam@bolte.cloud'
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

let rooms = [
    {
        description: 'MOTEL ONE - Einzelzimmer',
        tax: 19,
        price: 100,
        qt: 1,
    }, 
    {
        description: 'MOTEL ONE - Doppelzimmer',
        tax: 19,
        price: 180,
        qt: 1,
    }
]

const invoice = invoiceIt.create(recipient, emitter);
invoice.article = rooms;
invoice.getInvoice().toPDF().toFile('./invoice.pdf').then(() => {
    console.log('PDF file created.');
});