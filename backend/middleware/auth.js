const jwt = require("jsonwebtoken");
const User = require("../models/User");

const clearPendingLoginCookie = (res) => {
  const options = {
    httpOnly: true,
    sameSite: "lax",
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.clearCookie("pending_login", options);
};

// Require valid pending login token before OTP verification
exports.requirePendingLogin = async (req, res, next) => {
  const token =
    (req.cookies && req.cookies.pending_login) ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1]);

  if (!token || token === "none") {
    return res
      .status(401)
      .json({ success: false, message: "Pending login required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.stage !== "otp_pending" || !decoded.id) {
      clearPendingLoginCookie(res);
      return res
        .status(401)
        .json({ success: false, message: "Pending login expired" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      clearPendingLoginCookie(res);
      return res
        .status(401)
        .json({ success: false, message: "Pending login expired" });
    }

    req.pendingUser = user;
    next();
  } catch (err) {
    console.log(err.stack);
    clearPendingLoginCookie(res);
    return res
      .status(401)
      .json({ success: false, message: "Pending login expired" });
  }
};

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token  || token=='null' || token === "none") {
    return res
      .status(401)
      .json({ success: false, message: "Not authorize to access this route" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorize to access this route" });
    }

    req.user = user;

    next();
  } catch (err) {
    console.log(err.stack);
    return res
      .status(401)
      .json({ success: false, message: "Not authorize to access this route" });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
