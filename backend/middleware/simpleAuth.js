// Simple Basic Auth for Manager (v1)
module.exports = (req, res, next) => {
  const username = req.headers.username;
  const password = req.headers.password;

  // You can use .env values
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return next();
  }

  res.status(401).json({ message: "Unauthorized: Manager only" });
};
