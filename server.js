// Imports
const express = require("express"); // library module name
const dotenv = require("dotenv"); // import .env variable library
const mongoose = require("mongoose");

// middleware that help with request conversion + logging
const methodOverride = require("method-override");
const morgan = require("morgan");

// APP + Configurations
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// opens connection to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// mongoose connection event listeners
mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});
mongoose.connection.on("error", (err) => {
  console.log(err);
});

// IMPORT mongoose models
const Fruit = require("./models/fruit");

// configure view engine
app.set("view engine", "ejs");

// Middleware - app.use() - processes request before any routes are accessed
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));

// Landing Page - Home page
// ROLE - provide information about the app / site
app.get("/", (req, res) => {
  res.render("index");
});

// New Fruit Route - GET - /fruits/new
// ROLE -> render a form (new.ejs)
app.get("/fruits/new", (req, res) => {
  res.render("fruits/new");
});

// Show Route
// ROLE -> display a single instance of a resource (fruit) from the database
app.get("/fruits/:id", async (req, res) => {
  try {
    const foundFruit = await Fruit.findById(req.params.id);
    res.render("fruits/show", { fruit: foundFruit });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

// app.get - Fruit index route - GET - /fruits
app.get("/fruits", async (req, res) => {
  try {
    const allFruits = await Fruit.find();
    res.render("fruits/index", { fruits: allFruits, message: "Hello Friend" });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

// app.post - POST - /fruits
app.post("/fruits", async (req, res) => {
  if (req.body.isReadyToEat) {
    req.body.isReadyToEat = true;
  } else {
    req.body.isReadyToEat = false;
  }

  try {
    await Fruit.create(req.body);
    res.redirect("/fruits/new?status=success");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// app.delete
app.delete("/fruits/:id", async (req, res) => {
  try {
    await Fruit.findByIdAndDelete(req.params.id);
    // console.log(deletedFruit, "response from db after deletion");
    res.redirect("/fruits");
  } catch (err) {
    console.log(err);
    res.redirect(`/`);
  }
});

// app.get - EDIT route

// app.put - UPDATE route

// Server handler
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

/*
LESSON NOTES

TOOL Glossary: 

dotenv.config() - loads contents of .env to set different variables used in the application

mongoose.connect() - creates an active connnection to MongoAtlas when server starts 

app.set() - sets a local property -> communicating to express what library to use for rendering templates

method-override - modifies an incoming request from POST to the specified _method value (example DELETE, or PUT)
 
express.urlencoded() - REQUIRED - decodes the form data sent from the client -> stores the key value pairs in req.body object made available to POST and PUT routes

morgan - OPTIONAL outputs well formatted request info to node terminal ->  GET /fruits/66e364f089decdddff8012e3 304 41.161 ms o
 
res.redirect() - closes open request and tells the browser to navigate to a new location (makes a GET request)

res.render( resource-dir/template-name, { ...data } ) - sends as dynamically rendered HTML page to the browser, can populate HTML with 'context' data provided when called. 
    note: express assumes all views (templates) live inside of localhost:3000/views/fruits/new so no leading slash is required for a render path argument.

Summary of MEN stack build steps:  
    Building a home page:
    1. stub out the route - app.get('/', (req,res)=>{})
    2. sending back a test message - res.send("message-tktk")
    3. Create a template inside a view directory - views/index.js or views/home.ejs
    4. replace res.send with a res.render()
    3. In your browser, navigate to your localhost:3000/ to confirm the route is working

    Building a new fruit route 
    1. stub out the route - app.get('/fruits', (req,res)=>{})
    2. sending back a test message - res.send("Fruit New - message-tktk")
    3. Create a template inside a view directory - views/fruits/new.ejs 
    4. Populate a form that sends a POST request to 'fruits/' - the form should contain inputs for each of the properties in your schema
    4. Replace res.send with a res.render('fruits/new')
    3. In your browser, navigate to your localhost:3000/fruits/new to confirm the route is working

    Building a create fruit route:
    0. Add express.urlencoded middleware before all of your routes 
    1. stub out the route - app.post('/fruits', (req,res)=>{})
    2. sending back a test message - res.send("Create Fruits - message-tktk")
    3. Test the new page form is sending request and showing your creates response message
    4. setup your try catch inside the route callback
    5. make a DB call to Fruit.create(req.body)
    6. Redirect on success back to home or fruits index route (note: will cause error without route being defined first)

    Building an fruits index route:
    0. Repeat standard setup steps
    1. access data from DB -  Fruit.find() -> [ ]
    2. sent the data directly to the client - res.send(allFruits)
    3. renders the template - res.render('fruits/show', {fruits: allFruits})

    Building a show route:
    0. Repeat standard setup steps
    1. path -> '/fruits/:id'
    2. method -> GET
    3. DB loopup -> Fruit.findById(req.params.id) / Fruit.findOne( {name: "example"})
    4. express response -> res.render() -> render information about a single fruit

    Build a delete route:
    1. install method-override dependency
    2. import library to server.js - const methodOverride('method-override')
    3. mount the methodOverride middleware before your routes -  app.use() 
    4. add a form to your show route which includes a correctly structured action string - 
        4a. your form tag should look like: <form action="<endpoint-for-delete>?_method=DELETE" method=POST>...</form>
    5. define your app.delete() route 
        5a. path - '/fruits/:id'
        5b. method - DELETE
        5c. populate try catch
        5d. make your database call inside your and log results
        5e. redirect back to fruits index route 
    6. Test your form is routed correctly 
*/
