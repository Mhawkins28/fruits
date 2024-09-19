const Fruit = require("../models/fruit");

const getAllFruits = async (req, res) => {
  try {
    const allFruits = await Fruit.find();
    res.render("fruits/index", { fruits: allFruits, message: "Hello Friend" });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
};

const getOneFruit = async (req, res) => {
  try {
    const foundFruit = await Fruit.findById(req.params.id);
    // const variable = await Model.findById()
    const contextData = { fruit: foundFruit };
    res.render("fruits/show", contextData);
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
};

const getNewForm = (req, res) => {
  res.render("fruits/new");
};

const createFruit = async (req, res) => {
  if (req.body.isReadyToEat) {
    req.body.isReadyToEat = true;
  } else {
    req.body.isReadyToEat = false;
  }

  try {
    await Fruit.create(req.body);
    res.redirect("/fruits");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteFruit = async (req, res) => {
  try {
    await Fruit.findByIdAndDelete(req.params.id);
    // console.log(deletedFruit, "response from db after deletion");
    res.redirect("/fruits");
  } catch (err) {
    console.log(err);
    res.redirect(`/`);
  }
};

const getEditForm = async (req, res) => {
  try {
    const fruitToEdit = await Fruit.findById(req.params.fruitId);
    res.render("fruits/edit", { fruit: fruitToEdit });
  } catch (err) {
    console.log(err);
    res.redirect(`/`);
  }
};

const editFruit = async (req, res) => {
  try {
    // console.log(req.body, 'testing data from form')

    if (req.body.isReadyToEat === "on") {
      req.body.isReadyToEat = true;
    } else {
      req.body.isReadyToEat = false;
    }

    await Fruit.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // findByIdAndUpdate - breakdown of arguments:
    // 1. id - the resource _id property for looking the document
    // 2. req.body - data from the form
    // 3. {new: true} option is provided as an optional third argument

    res.redirect(`/fruits/${req.params.id}`);
  } catch (err) {
    console.log(err);
    res.redirect(`/fruits/${req.params.id}`);
  }
};

module.exports = {
  getAllFruits,
  getOneFruit,
  createFruit,
  deleteFruit,
  editFruit,
  getNewForm,
  getEditForm,
};
