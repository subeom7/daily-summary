const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

require('dotenv').config();

const port = 5000;

const connectionString = process.env.MONGO_CONNECTION

// Mongoose connection
mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Could not connect to MongoDB: ', error));

// User schema and model
const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: String,
  categories: [String]
});

const User = model('User', userSchema);

app.use(cors());
app.use(express.json()); // Built-in middleware to parse incoming json

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/saveUser', async (req, res) => {
  const { email, categories } = req.body;

  // Data validation
  if (typeof email !== 'string' || !Array.isArray(categories) || !categories.every(c => typeof c === 'string')) {
    return res.status(400).send('Invalid data format');
  }

  try {
    await User.findOneAndUpdate(
      { email },
      { email, categories },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.send('User saved!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving user');
  }
});

app.post('/sendEmail', async (req, res) => {
  const userEmail = req.body.userEmail;

  let user;
  try {
    user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send('User not found');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error fetching user');
  }

  const categories = user.categories.join('\n');  // Joining categories with new line

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  let info;
  try {
    info = await transporter.sendMail({
      from: '"SK" <subeomkwon@gmail.com>', // sender address
      to: userEmail, // list of receivers
      subject: "Your Subscribed Categories", // Subject line
      text: categories, // Sending categories in plain text
      html: `<b>${categories.replace(/\n/g, '<br>')}</b>`, // Replacing new lines with <br> for HTML version
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error sending email');
  }

  res.send('Email sent!');
});

app.listen(port, () => {
  console.log(`Server started and listening on port ${port}`)
});
