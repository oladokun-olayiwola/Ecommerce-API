const User = require("../../models/User");
const { StatusCodes } = require("http-status-codes");

const createTokenUser = require("../../utils/createTokenUser");
const checkPermissions = require('../../utils/checkPermissions')
const attachCookieToresponse = require("../../utils/attachCookiesToResponse");
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../errors");

const getAllUsers = async (req, res) => {
  const user = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ user });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new NotFoundError(`No user with id : ${req.params.id}`);
  }

  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// Using save method
const updateUser = async (req, res) => {
  const { userId: id } = req.user;
  const { email, name } = req.body;
  if (!name || !email) {
    throw new BadRequestError("Please provide credentials");
  }
  const user = await User.findOne({ _id: id });
  if (!user) {
    throw new NotFoundError("Invalid credentials");
  }
  user.name = name;
  user.email = email;
  await user.save();

  const payload = createTokenUser(user);
  attachCookieToresponse({ res, payload });
  return res.status(StatusCodes.OK).json({ user: payload });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Please provide both values");
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid credentials");
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success" });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};

// Using find one and update
// const updateUser = async (req, res) => {
//   const { userId: id } = req.user;
//   const { email, name } = req.body;
//   if(!name || !email) {
//     throw new BadRequestError('Please provide credentials')
//   }
//    const user = await User.findOneAndUpdate(
//      { _id: id, role: "user" },
//      { name, email },
//      {new: true, runValidators: true}
//    );
//   if (!user) {
//     throw new NotFoundError("Invalid credentials");
//   }
//   const payload = createTokenUser(user)
//   attachCookieToresponse(res, payload)
//   return res.status(StatusCodes.OK).json({ user: payload });
// };
