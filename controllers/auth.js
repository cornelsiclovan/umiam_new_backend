const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult, body } = require("express-validator");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);

  try {
    if (!req.body.repeatPassword) {
      const error = new Error("Repeated password cannot be empty!");
      error.statusCode = 422;
      throw error;
    }

    if (req.body.repeatPassword !== req.body.password) {
      const error = new Error("Passwords do not match");
      error.statusCode = 422;
      throw error;
    }

    if (!errors.isEmpty()) {
      const error = new Error("Registration failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
  } catch (error) {
    next(error);
    return;
  }

  const buffer = await crypto.randomBytes(32);
  const registryToken = buffer.toString("hex");
  const registryTokenExpiration = Date.now() + 3600000;

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  // try {
  //   await transporter.sendMail({
  //     to: email,
  //     from: "cornel.siclovan@gmail.com",
  //     subject: "Please confirm your email address",
  //     html: `
  //       <p>Please confirm your email address</p>
  //       <p>Click this <a href="http://localhost:3000/confirm-account-registry/${registryToken}"/></a></p>
  //     `
  //   })
  // } catch (error) {
  //   next(error);
  //   return;
  // }

  try {
    const hashedPw = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name,
      email: email,
      password: hashedPw,
      registryToken: registryToken,
      registryTokenExpiration: registryTokenExpiration,
    });

    res.status(200).json({
      message: "User created!",
      userId: user.id,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      const error = new Error("Login failed!");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
  } catch (error) {
    next(error);
    return;
  }

  const email = req.body.email;
  const password = req.body.password;

  let loadedUser;

  try {
    const user = await User.findOne({
      where: { email: email, registryToken: null },
    });

    if (!user) {
      const error = new Error("This email could not be found!");
      error.statusCode = 401;
      throw error;
    }

    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser.id,
      },
      "secret",
      { expiresIn: "24h" }
    );

    res
      .status(200)
      .json({
        token: token,
        userId: loadedUser.id,
        isAdmin: loadedUser.isAdmin,
        isOwner: loadedUser.isOwner,
      });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
};

exports.confirmAccount = async (req, res, next) => {
  const registryToken = req.body.registryToken;

  try {
    if (!registryToken) {
      const error = new Error("No token available!");
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findOne({
      where: {
        registryToken: registryToken,
      },
    });

    if (!user) {
      const error = new Error("This user does not exist");
      error.statusCode = 400;
      throw error;
    }

    if (Date.parse(user.registryTokenExpiration) / 1000 > Date.now()) {
      const error = new Error("Token expired");
      error.statusCode = 400;
      throw error;
    }

    user.registryToken = null;
    user.registryTokenExpiration = null;

    await user.save();
    res.status(200).json({
      message: "Account activated",
    });
  } catch (error) {
    next(error);
  }
};

exports.postReset = async (req, res, next) => {
  try {
    const buffer = await crypto.randomBytes(32);
    const token = buffer.toString("hex");
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 400;
      throw error;
    }

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;

    console.log(Date.now() + 3600000);

    user.save();

    transporter
      .sendMail({
        to: req.body.email,
        from: "cornel.siclovan@gmail.com",
        subject: "Password reset for your UMIAM account",
        html: `
          <p>You requested a password reset</p>
          <p>Click this link <a href="http://localhost:8080/reset/${token}"> link </a> to set a new password.</p>
        `,
      })
      .catch((error) => next(error));

    res.status(200).json({
      message: "Access your email account to reset your password.",
    });
  } catch (error) {
    next(error);
  }
};

exports.postNewPassword = async (req, res, next) => {
  try {
    if (!req.body) {
      const error = new Error("No token sent or password");
      error.statusCode = 400;
      throw error;
    }

    const newPassword = req.body.password;
    const passwordToken = req.body.passwordToken;

    const resetUser = await User.findOne({
      where: {
        resetToken: passwordToken,
      },
    });

    if (!resetUser) {
      const error = new Error("This user does not exist");
      error.statusCode = 400;
      throw error;
    }

    if (resetUser.resetToken !== passwordToken) {
      const error = new Error("This user does not exist");
      error.statusCode = 400;
      throw error;
    }

    if (Date.parse(resetUser.resetTokenExpiration) / 1000 > Date.now()) {
      const error = new Error("Token expired");
      error.statusCode = 400;
      throw error;
    }

    resetUser.password = await bcrypt.hash(newPassword, 12);
    resetUser.resetToken = null;
    resetUser.resetTokenExpiration = null;

    await resetUser.save();
    res.status(200).json({
      message: "Password changed!",
    });
  } catch (error) {
    next(error);
  }
};
