const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  createStaff, 
  getAllStaff,   
  deleteStaff,   
  updateStaff    
} = require("../controllers/authController");

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Admin Management Routes
router.post("/create-staff", createStaff);
router.get("/staff", getAllStaff);           
router.delete("/staff/:id", deleteStaff);    
router.put("/staff/:id", updateStaff);       

module.exports = router;