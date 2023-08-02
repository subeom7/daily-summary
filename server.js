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

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  let info = await transporter.sendMail({
    from: '"SK" <subeomkwon@gmail.com>', // sender address
    to: userEmail, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  res.send('Email sent!');
});

app.listen(port, () => {
  console.log(`Server started and listening on port ${port}`)
});
