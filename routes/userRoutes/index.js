const express = require("express");
const router = express.Router();

const { authorizePermissions } = require("../../middleware/authentication");

const {
  updateUserPassword,
  updateUser,
  getAllUsers,
  getSingleUser,
  showCurrentUser,
} = require("../../controllers/userController/index.js");

router.route("/").get(authorizePermissions("admin"), getAllUsers);

router.get("/showMe", showCurrentUser);
router.route("/updateUser").patch(updateUser);
router.route("/updateUserPassword").patch(updateUserPassword);

router.route("/:id").get(getSingleUser);

module.exports = router;
