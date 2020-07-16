# How to run the service
## Requirements
- Node v12.16.3
- npm

## Run the service
- Copy `@rimiti` to node_modules. It's a customized version to support DE and some other stuff.
- Open the index.js and change the baseUrl to your local Camunda BPM server adress here: `const config = { baseUrl: 'http://bolte.cloud:8080/engine-rest/', use: logger };` Make sure to keep the `/engine-rest/` part!
- Open your terminal
    - Make sure you are in the same directory as the index.js. If not, use `cd`to change your directory
    - Run `npm install` to install the dependencies.
    - Run `node index.js` to start the service. Keep your terminal open.
    - If you want to stop the service, use CTRL-C and close your terminal