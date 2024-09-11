const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  details: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    address: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  timeStart: {
    type: String,
    required: true,
  },
  timeEnd: {
    type: String,
    required: true,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  organizerName: {
    type: String,
    required: true,
  },
  organizerContact: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
    required: false,
  },
  attendees: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Event", EventSchema);
