const crypto = require("crypto");
const sanitize = require("mongo-sanitize");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public

exports.register = async (req, res, next) => {
  try {
    const { name, telephone, email, password, role } = req.body;
    //Create user
    const user = await User.create({ name, telephone, email, password, role });

    // const token = user.getSignedJwtToken();
    // res.status(200).json({ success: true, token });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = sanitize({ ...req.body});

    // Validate email & password
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, msg: "Please provide an email and password" });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otpCode).digest("hex");
    const otpExpireMinutes = Number(process.env.OTP_EXP_MINUTES) || 10;
    const otpExpire = new Date(Date.now() + otpExpireMinutes * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      loginOtpCode: hashedOtp,
      loginOtpExpire: otpExpire,
    });

    try {
      await sendEmail({
        email: user.email,
        subject: "Your login OTP code",
        message: `Your login OTP code is ${otpCode}. It will expire in ${otpExpireMinutes} minutes.`,
      });
    } catch (emailErr) {
      console.log(emailErr.stack);
      await User.findByIdAndUpdate(user._id, {
        $unset: { loginOtpCode: 1, loginOtpExpire: 1 },
      });

      return res.status(500).json({
        success: false,
        msg: "Unable to send OTP email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      otpRequired: true,
      msg: "OTP sent to email. Please verify to complete login.",
    });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      msg: "Login failed. Please try again.",
    });
  }
};

// @desc    Verify OTP after successful password login
// @route   POST /api/v1/auth/verify-otp
// @access  Public (follows a password-authenticated login)
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = sanitize({ ...req.body });

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, msg: "Please provide email and otp" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.loginOtpCode || !user.loginOtpExpire) {
      return res.status(400).json({
        success: false,
        msg: "Invalid or expired OTP",
      });
    }

    if (user.loginOtpExpire.getTime() < Date.now()) {
      await User.findByIdAndUpdate(user._id, {
        $unset: { loginOtpCode: 1, loginOtpExpire: 1 },
      });
      return res
        .status(400)
        .json({ success: false, msg: "OTP has expired. Please login again." });
    }

    const hashedOtp = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    if (hashedOtp !== user.loginOtpCode) {
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP",
      });
    }

    await User.findByIdAndUpdate(user._id, {
      $unset: { loginOtpCode: 1, loginOtpExpire: 1 },
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      msg: "OTP verification failed",
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true; // ใช้ cookie secure ถ้าเป็น production (HTTPS เท่านั้น)
  }

  res.status(statusCode).json({
    success: true,
    _id: user._id,
    name: user.name,
    telephone: user.telephone,
    email: user.email,
    token,
  });
};

// @desc    Get current Logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
};

//@desc    Log user out / clear cookie
//@route   GET /api/v1/auth/logout
//@access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};
