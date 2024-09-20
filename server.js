// Imports
const express = require("express"); // library module name
const dotenv = require("dotenv"); // import .env variable library
const mongoose = require("mongoose");
const fruitController = require("./controllers/fruits.js");

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

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));

// Landing Page - Home page
// ROLE - provide information about the app / site

app.get("/", (req, res) => {
  res.render("index");
});

// ROUTER for Fruits

// New Fruit Route - GET - /fruits/new
// ROLE -> render a form (new.ejs)
app.get("/fruits/new", fruitController.getNewForm);

// app.get - Fruit index route - GET - /fruits
app.get("/fruits", fruitController.getAllFruits);

// Show Route
// ROLE -> display a single instance of a resource (fruit) from the database
app.get("/fruits/:id", fruitController.getOneFruit);

// app.post - POST - /fruits
app.post("/fruits", fruitController.createFruit);

// app.delete
app.delete("/fruits/:id", fruitController.deleteFruit);

// app.get - EDIT route
app.get("/fruits/:fruitId/edit", fruitController.getEditForm);

// app.put - UPDATE route
app.put("/fruits/:id", fruitController.editFruit);

// app.post - CREATE images route
app.post("/fruits/:fruitId/images", async (req, res) => {
  console.log("req.body", req.body);
  console.log("req.params", req.params);
  // res.send('hitting images create route')
  try {
    // 1. find the document
    const foundFruit = await Fruit.findById(req.params.fruitId);

    if (req.body.uploadedBy === "") {
      delete req.body.uploadedBy;
      console.log("after parsing", req.body);
    }

    // 2. modify the field that is storing the subDoc
    foundFruit.images.push(req.body);

    // 3. save - modify the db collection for that found doc

    await foundFruit.save(); 
    // save -> instruct mongoose to validate the updated data and write the update to the fruits collection

    // 4. redirect to some new location
    res.redirect(`/fruits/${req.params.fruitId}`);
  } catch (err) {
    console.log(err);
    res.redirect(`/fruits/${req.params.fruitId}`);
  }
});

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

    Build an edit route
    1. define your app.get() route
      1a. path - '/fruits/:id/edit'
      1b. method - GET
      1c. populate try catch
      1d. make database call for current fruit - Fruit.findById(req.params.id)
      1e. create a new template and add a form which includes a correctly structured action string - 
        - your form's opening tag should look like: <form action="/fruits/<%=fruit._id%>?_method=PUT" method=POST>...</form>
        - your form body should include inputs tags for all fields you want to edit 
        - note: your form input should include a value attribute to pre populate your data-
            <input ...  value="<%= fruit.name %>"/> 
      1e. render template ('fruits/edit.ejs') and pass context {fruit: foundFruit}

    Build an update route
    1. define your app.put() route
      1a. path - '/fruits/:id/'
      1b. method - PUT
      1c. test req.body content contains form data from edit page
      1d. parse any incoming data to match the values expected by the schema (ex: isReadyToEat might send "on" -- needs to be converted to boolean first)
      1c. populate try catch
      1d. make database call for current fruit - Fruit.findByIdAndUpdate(req.params.id, req.body, {new:true})
    2. After data is updated in DB, redirect back to show page for fruit.
*/
