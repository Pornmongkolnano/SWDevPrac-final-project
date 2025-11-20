const CoworkingSpace = require("../models/CoworkingSpace");
const Reservation = require("../models/Reservation");

// @desc    Get all co-working spaces
// @route   GET /api/v1/coworking-spaces
// @access  Public
exports.getCoworkingSpaces = async (req, res, next) => {
  try {
    // 1) Clone query
    const reqQuery = { ...req.query };

    // 2) Remove special fields
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);

    // 3) Build query string & operators
    // allow: gt,gte,lt,lte,in
    let queryStr = JSON.stringify(reqQuery).replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // 4) Base query
    let query = CoworkingSpace.find(JSON.parse(queryStr)).populate(
      "reservations"
    );

    // 5) Select specific fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" "); // space-separated
      query = query.select(fields);
    }

    // 6) Sort: ?sort=name,-createdAt  (default -createdAt)
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // 7) Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await CoworkingSpace.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // 8) Execute
    const coworkingSpaces = await query;

    // 9) Pagination result
    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    return res.status(200).json({
      success: true,
      count: coworkingSpaces.length,
      pagination,
      data: coworkingSpaces,
    });
  } catch (err) {
    console.error("getCoworkingSpaces error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single co-working space
// @route   GET /api/v1/coworking-spaces/:id
// @access  Public
exports.getCoworkingSpace = async (req, res, next) => {
  try {
    const coworkingSpace = await CoworkingSpace.findById(req.params.id);
    if (!coworkingSpace) {
      return res.status(400).json({
        success: false,
        message: `Co-working space not found with id of ${req.params.id}`,
      });
    }
    return res.status(200).json({ success: true, data: coworkingSpace });
  } catch (err) {
    console.error("getCoworkingSpace error:", err);
    // invalid ObjectId → 400
    return res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create co-working space
// @route   POST /api/v1/coworking-spaces
// @access  Private
exports.createCoworkingSpace = async (req, res, next) => {
  try {
    const coworkingSpace = await CoworkingSpace.create(req.body);
    return res.status(201).json({ success: true, data: coworkingSpace });
  } catch (err) {
    console.error("createCoworkingSpace error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update co-working space
// @route   PUT /api/v1/coworking-spaces/:id
// @access  Private
exports.updateCoworkingSpace = async (req, res, next) => {
  try {
    const coworkingSpace = await CoworkingSpace.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!coworkingSpace) {
      return res.status(404).json({
        success: false,
        message: `Co-working space not found with id of ${req.params.id}`,
      });
    }

    return res.status(200).json({ success: true, data: coworkingSpace });
  } catch (err) {
    console.error("updateCoworkingSpace error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete co-working space (+ cascade reservations)
// @route   DELETE /api/v1/coworking-spaces/:id
// @access  Private
exports.deleteCoworkingSpace = async (req, res, next) => {
  try {
    const coworkingSpace = await CoworkingSpace.findById(req.params.id);

    if (!coworkingSpace) {
      return res.status(404).json({
        success: false,
        message: `Co-working space not found with id of ${req.params.id}`,
      });
    }

    await Reservation.deleteMany({ coworkingSpace: req.params.id });
    await CoworkingSpace.deleteOne({ _id: req.params.id });

    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error("deleteCoworkingSpace error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};
