// Imports
const express = require("express"); // library module name
const dotenv = require("dotenv"); // import .env variable library
const mongoose = require("mongoose");

// APP + Configurations
dotenv.config();
// console.log('connection string', process.env.MONGODB_URI)

// process.env - global object node uses for storing information about the environment

const app = express();
const PORT = process.env.PORT || 3000; // use .env to set different (dynamic) port variables

mongoose.connect(process.env.MONGODB_URI); // opens connection to MongoDB

// mongoose connection event listener
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// mongoose connection event listener
mongoose.connection.on("error", (err) => {
  console.log(err);
});

// IMPORT mongoose models
const Fruit = require("./models/fruit");
// console.log(Fruit)

// sets a local property -> communicating to res.render() what library to use
app.set("view engine", "ejs");

// Middleware - does stuff with request
// app.use()

//app.use(express.urlencoded) -> required anytime a client is sending data using an HTML Form

app.use(express.urlencoded({ extended: false })); //express.urlencoded -decodes the form data -> stores the key value pairs in req.body

// Routes

// Landing Page - Home page
app.get("/", (req, res) => {
  // stub out the route - sending back a test message
  // confirm the route is working as expecting
  // res.send("Hello, friend!")
  res.render("index");
});

// New Fruit Route - GET - /fruits/new - ROLE -> render a form (new.ejs)
app.get("/fruits/new", (req, res) => {
  // res.send('Ready to create a new fruit')
  // express assumes all views (templates) live inside of localhost:3000/views/fruits/new
  res.render("fruits/new");
});

// app.post - POST - /fruits -> ROLE create a new Fruit document

app.post("/fruits", async (req, res) => {
    
    //
    // 1. check that the request body is populate
    // add express middleware
    // parse the data (req.body) -> conforms to the schema data types
    if (req.body.isReadyToEat) {
        req.body.isReadyToEat = true;
    } else {
        req.body.isReadyToEat = false;
    }

    // console.log(req.body);

    // res.send(req.body);

    try {
        const createdFruit = await Fruit.create(req.body)
        // res.status(201).send(createdFruit)
        res.redirect('/fruits/new?status=success')
        // tells the client -> make a new GET to the address provided 
    } catch(err){
        res.status(400).json({error: err.message})
    }

  // try catch
  // convert function to async
  // save the client data in the data base -> Fruit.create(data)
});

// app.delete

// app.put

// Server handler
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
