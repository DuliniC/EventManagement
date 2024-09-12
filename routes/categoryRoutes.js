const express = require("express");
const Category = require("../models/Category");
const Event = require("../models/Event");

const router = express.Router();

// Get all categories (GET)
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).send(err);
  }
});

//Get by ID
router.get("/categories/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    res.json(category);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Create Category (POST)
router.post("/categories", async (req, res) => {
  const { name } = req.body;
  const newCategory = new Category({ name });
  try {
    await newCategory.save();
    res.redirect("/");
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete a category (DELETE)
router.delete("/categories/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Event.find({ categories: { $in: [id] } });
    if(data.length > 0){
      res.status(400).json({message : "This Category cannot be deleted since Associated with events."})
    }else{
      await Category.findByIdAndDelete(id);
      res.status(200).json({message : "Category Deleted"})  
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

//Update
router.put("/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;
