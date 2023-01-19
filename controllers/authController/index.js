const User = require("../../models/User");
const { BadRequestError, UnauthenticatedError } = require("../../errors/index");
const { StatusCodes } = require("http-status-codes");
const createTokenUser = require('../../utils/createTokenUser')
const attachCookiesToResponse = require("../../utils/attachCookiesToResponse");

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const payload = createTokenUser(user)
  attachCookiesToResponse({ res, payload });
  res.status(StatusCodes.OK).json({ payload });
};
const logout = async (req, res) => {
      res.cookie("token", "logout", {
        httpOnly: true,
        expires: new Date(Date.now()),
      });
  res.status(StatusCodes.OK).json({msg: "User Logged out"})
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new BadRequestError("Email already exists");
  }
  const isFirst = await User.countDocuments({});
  const role = isFirst === 0 ? "admin" : "user";
  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  const payload = createTokenUser(user)
  attachCookiesToResponse({ res, payload });
  res.status(StatusCodes.CREATED).json({ payload });
};

module.exports = { logout, login, register };
