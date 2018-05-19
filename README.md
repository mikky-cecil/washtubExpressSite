# Washtub Laundromat Machine Inventory

A web application for tracking machine inventory for the Washtub Laundromat. Made with Node.js, Express, Javascript, jQuery, and Bootstrap. Demonstrates basic REST functionality.

### Prerequirements
* [Node.js](https://nodejs.org/en/download/)
* [Mongodb](https://www.mongodb.org/downloads#production)

### Preparation
* Clone repository
* Create folder ./data in repository root folder
* run ``` npm install ``` in the working directory
* run ``` mongod --dbpath ./data ``` to start up the mongodb
* run ``` npm start ``` and browse to http://localhost:3000

## Screenshots

Initial view of page, before selecting a machine
![Initial view of page](./screenshots/InitialIndex.png)
Show Machine area fills up after machine is selected
![After adding machines](./screenshots/Index.png)
Add machine form catches errors
![Form catches errors](./screenshots/AddMachineErrors.png)
