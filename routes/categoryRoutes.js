const express = require("express");
const Category = require("../models/Category");
const router = express.Router();

// Get all categories (GET)
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories); // Send as JSON to frontend
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/categories/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    res.json(category); // Send as JSON to frontend
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
    await Category.findByIdAndDelete(id);
  } catch (err) {
    res.status(500).send(err);
    console.log(err);
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
