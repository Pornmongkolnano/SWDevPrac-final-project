const express = require("express");
const {
  register,
  login,
  verifyOtp,
  getMe,
  logout,
} = require("../controllers/auth");

const router = express.Router();

const { protect, requirePendingLogin } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", requirePendingLogin, verifyOtp);
router.get("/me", protect, getMe);
router.get('/logout',logout);

module.exports = router;
