// Imports
const express = require("express"); // library module name
const dotenv = require("dotenv"); // import .env variable library
const mongoose = require("mongoose");
const fruitController = require("./controllers/fruits.js");

// middleware that help with request conversion + logging
const methodOverride = require("method-override");
const morgan = require("morgan");
const path = require("path");

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

app.use(express.static(path.join(__dirname, "public")));

// Landing Page - Home page
app.get("/", (req, res) => {
  res.render("index");
});

// ROUTER for Fruits
// New Fruit Route - GET - /fruits/new
app.get("/fruits/new", fruitController.getNewForm);

// app.get - Fruit index route - GET - /fruits
app.get("/fruits", fruitController.getAllFruits);

// Show Route - GET - /fruits/:fruitId
app.get("/fruits/:id", fruitController.getOneFruit);

// app.post - POST - /fruits
app.post("/fruits", fruitController.createFruit);

// app.delete - DELETE - /fruits/:fruitId
app.delete("/fruits/:id", fruitController.deleteFruit);

// app.get - EDIT route - /fruits/:fruitId/edit
app.get("/fruits/:fruitId/edit", fruitController.getEditForm);

// app.put - UPDATE route - PUT - /fruits/:fruitId
app.put("/fruits/:id", fruitController.editFruit);

// app.post - CREATE images route - POST - /fruits/:fruitId/images
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
