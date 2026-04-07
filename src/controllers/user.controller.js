const User = require("../models/user.model");
const { success } = require("../utils/apiResponse");

// prof ans TA can access the feature only 
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    return success(res, "Users fetched", users);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return success(res, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};
