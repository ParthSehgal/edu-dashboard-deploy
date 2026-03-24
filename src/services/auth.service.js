// NOTE: DB will be added later

exports.register = async ({ name, email, password }) => {
  return {
    name,
    email
  };
};

exports.login = async ({ email, password }) => {
  return {
    token: "dummy-token",
    email
  };
};

if (!email || !password) {
  return res.status(400).json({ message: "Email and password required" });
}