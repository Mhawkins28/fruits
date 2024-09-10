// models/fruit

const mongoose = require('mongoose')

// define a schema for all Fruit documents
const fruitSchema = new mongoose.Schema({
    // structure the keys / properties in our document
    name: String, 
    isReadyToEat: Boolean,
    // add a new key for storing 'color' 
    color: String
    // validators (schema) -> mongoose document

}) // schema class -> 

// register the model using the schema
const Fruit = mongoose.model("Fruit", fruitSchema)

// export the model object 
module.exports = Fruit // ??? - export a value that allows that value to be accessible outside of fruit.js