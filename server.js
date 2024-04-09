// server.js

require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

let isAuthenticated = false;

// Authentication middleware
function authenticate(req, res, next) {
  if (isAuthenticated) {
    next(); // Proceed to the next middleware
  } else {
    res.status(401).json({ message: "Unauthorized" }); // Send 401 Unauthorized response
  }
}

// Dummy users for demonstration (replace with your actual authentication logic)
const users = [
  {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  },
];

// Authentication route
app.post("/authenticate", (req, res) => {
  const { username, password } = req.body;

  // Check if the provided username and password match any user in the users array
  const authenticatedUser = users.find(
    (user) => user.username === username && user.password === password
  );

  if (authenticatedUser) {
    isAuthenticated = true;
    res.status(200).json({ message: "Authentication successful" });
  } else {
    isAuthenticated = false;
    res.status(401).json({ message: "Invalid username or password" });
  }
});
app.get("/recipient-list", authenticate, (req, res) => {
  console.log("trigger", req);
  // Fetch recipients from environment variables or a database
  const recipientList = process.env.RECIPIENT_LIST.split(",");

  res.json({ recipients: recipientList });
});
// Email sending route
app.post("/send-email", authenticate, (req, res) => {
  const { content, recipients } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Email content is required." });
  }

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res
      .status(400)
      .json({ message: "At least one recipient is required." });
  }
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Update with your email service provider
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or application-specific password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipients.join(","), // Join multiple recipients with commas
    subject: "Subject of the email",
    text: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).json({ message: "Error occurred, email not sent." });
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).json({ message: "Email sent successfully!" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
