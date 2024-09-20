// models/fruit

const mongoose = require('mongoose')


const imageSchema = new mongoose.Schema({ 
    imageUrl: { type: String, require: true},
    uploadedBy: { type: String, default: "Guest" } // default-> set any value if no value is provided to the schema when a create instruction is given. 
})


// define a schema for all Fruit documents
const fruitSchema = new mongoose.Schema({
    // structure the keys / properties in our document
    name: String, 
    isReadyToEat: Boolean,
    // modify the Fruit schema to include an images field
    // images will store 0 or many Image documents created from the imageSchema 
    images:  [ imageSchema ],
    // growers: [ growerSchema or ObjectId ]
}) 

// register the model using the schema
const Fruit = mongoose.model("Fruit", fruitSchema)

// export the model object 
module.exports = Fruit // ??? - export a value that allows that value to be accessible outside of fruit.js