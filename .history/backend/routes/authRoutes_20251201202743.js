const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// REGISTER
router.post("/register", authController.register);

// LOGIN
router.post("/login", authController.login);

// GET LOGGED-IN USER
router.get("/me", authMiddleware, authController.getMe);

// UPDATE PROFILE (ONLY hourlyWage)
router.put("/update", authMiddleware, authController.updateProfile);

// DELETE ACCOUNT
router.delete("/delete", authMiddleware, authController.deleteAccount);

module.exports = router;
