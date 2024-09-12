const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

// Get all events (GET)
router.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events); // Send as JSON to frontend
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get by ID (GET)
router.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.json(event); // Send as JSON to frontend
  } catch (err) {
    res.status(500).send(err);
  }
});

//Get by Category
router.get("/events/category/:category", async (req, res) => {
  var param = req.params.category;
  try {
    const filteredEvents = await Event.find({ categories: { $in: [param] } });
    res.json(filteredEvents);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Create a new event (CREATE)
router.post("/events", async (req, res) => {
  const {
    name,
    details,
    date,
    timeStart,
    timeEnd,
    organizerName,
    categories,
    organizerContact,
    banner,
    location,
  } = req.body;

  try {
    const event = new Event({
      name,
      details,
      date,
      timeStart,
      timeEnd,
      categories,
      organizerName,
      organizerContact,
      banner,
      location,
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Update an event (UPDATE)
router.put("/events/:id", async (req, res) => {
  const {
    name,
    details,
    date,
    timeStart,
    timeEnd,
    organizerName,
    categories,
    organizerContact,
    banner,
    location,
    attendees,
  } = req.body;
  try {
    await Event.findByIdAndUpdate(req.params.id, {
      name,
      details,
      date,
      timeStart,
      timeEnd,
      categories,
      organizerName,
      organizerContact,
      banner,
      location,
      attendees,
    });
    res.status(200).json({message: "Update Successfully"});
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete an event (DELETE)
router.delete("/events/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Delete Event Successfully" });
  } catch (err) {
    res.status(500).send(err);
  }
});

// UPDATE RSVP
router.patch("/events/rsvp/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $inc: { attendees: 1 } },
      { new: true, runValidators: true } // `new: true` returns the updated document
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
