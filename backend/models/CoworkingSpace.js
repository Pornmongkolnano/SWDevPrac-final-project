const mongoose = require("mongoose");

const CoworkingSpaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a co-working space name"],
      unique: true,
      trim: true,
      maxlength: [100, "Name can not be more than 100 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    tel: {
      type: String,
      required: [true, "Please add a telephone number"],
      match: [/^\d{1,10}$/, "Telephone number must not exceed 10 digits"],
    },
    openTime: {
      type: String,
      required: [true, "Please add an opening time"],
    },
    closeTime: {
      type: String,
      required: [true, "Please add a closing time"],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Reverse populate with virtuals
CoworkingSpaceSchema.virtual("reservations", {
  ref: "Reservation",
  localField: "_id",
  foreignField: "coworkingSpace",
  justone: false,
});

module.exports = mongoose.model("CoworkingSpace", CoworkingSpaceSchema);
