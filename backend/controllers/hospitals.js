const Hospital = require("../models/Hospital");
const Appointment = require("../models/Appointment");

// @desc    Get all hospitals
// @route   GET /api/v1/hospitals
// @access  Public
exports.getHospitals = async (req, res, next) => {
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
    let query = Hospital.find(JSON.parse(queryStr)).populate("appointments");

    // 5) Select specific fields: ?select=name,province,postalcode
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
    const total = await Hospital.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // 8) Execute
    const hospitals = await query;

    // 9) Pagination result
    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    return res.status(200).json({
      success: true,
      count: hospitals.length,
      pagination,
      data: hospitals,
    });
  } catch (err) {
    console.error("getHospitals error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single hospital
// @route   GET /api/v1/hospitals/:id
// @access  Public
exports.getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(400).json({
        success: false,
        message: `Hospital not found with id of ${req.params.id}`,
      });
    }
    return res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    console.error("getHospital error:", err);
    // invalid ObjectId → 400
    return res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Create hospital
// @route   POST /api/v1/hospitals
// @access  Private
exports.createHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.create(req.body);
    return res.status(201).json({ success: true, data: hospital });
  } catch (err) {
    console.error("createHospital error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update hospital
// @route   PUT /api/v1/hospitals/:id
// @access  Private
exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: `Hospital not found with id of ${req.params.id}`,
      });
    }

    return res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    console.error("updateHospital error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete hospital (+ cascade appointments)
// @route   DELETE /api/v1/hospitals/:id
// @access  Private
exports.deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: `Hospital not found with id of ${req.params.id}`,
      });
    }

    await Appointment.deleteMany({ hospital: req.params.id });
    await Hospital.deleteOne({ _id: req.params.id });

    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error("deleteHospital error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
};