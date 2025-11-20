var express = require("express");
var router = express.Router();
var securityMiddleware = require("../middlewares/security");
var restaurantController = require("../controllers/restaurant");

// @desc    Get all restaurants
// @route   GET /restaurant/
// @access  Public
router.get("/", restaurantController.getAllRestaurants);

// @desc    Get restaurant by User
// @route   GET /restaurant/user
// @access  Private (Owner only)
router.get(
  "/user",
  securityMiddleware.checkJWT,      // <--- STEP 1: Verify Identity
  securityMiddleware.checkIfOwner,  // <--- STEP 2: Verify Role
  restaurantController.getRestaurantByOwnerId
);

// @desc    Get restaurants(by rest id)
// @route   GET /restaurant/:restId
// @access  Public
router.get("/:restId", restaurantController.getRestaurant);

// @desc    Create restaurants
// @route   POST /restaurant/create
// @access  Private (Owner only)
router.post(
  "/create",
  securityMiddleware.checkJWT,      // <--- ADDED THIS
  securityMiddleware.checkIfOwner,  // <--- Runs after Identity is verified
  restaurantController.createRestaurant
);

// @desc    Edit restaurant
// @route   POST /restaurant/:restId/edit
// @access  Private (Owner only)
router.post(
  "/:restId/edit",
  securityMiddleware.checkJWT,      // <--- ADDED THIS
  securityMiddleware.checkIfOwner,
  restaurantController.editRestaurant
);

// @desc    Delete restaurant
// @route   DELETE /restaurant/:restId/delete
// @access  Private (Owner only)
router.delete(
  "/:restId/delete",
  securityMiddleware.checkJWT,      // <--- ADDED THIS
  securityMiddleware.checkIfOwner,
  restaurantController.deleteRestaurant
);

module.exports = router;