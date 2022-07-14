const express = require("express");
const authController = require("../controllers/auth");
const { body } = require("express-validator/check");
const User = require("../models/user");
const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email!")
      .custom((value, { req }) => {
        return User.findOne({ where: { email: value } }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already exists!");
          }
        });
      })
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post("/login", [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail({ gmail_remove_dots: false }),
], authController.login);

router.post("/confirm-account-registry", authController.confirmAccount);
router.post("/reset", authController.postReset);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
  