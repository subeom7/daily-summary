const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');
const schedule = require('node-schedule');
const app = express();
const sgMail = require('@sendgrid/mail')

require('dotenv').config();

const port = 5000;

const API_KEY = process.env.API_KEY

const connectionString = process.env.MONGO_CONNECTION

const fs = require('fs');

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

const job = schedule.scheduleJob('11 14 * * *', function() {
  sendDailyUpdates();
});

async function sendDailyUpdates() {
  try {
    // Read URLs from the JSON file
    const rawData = fs.readFileSync('url_lists.json', 'utf-8');
    const visitedUrls = JSON.parse(rawData);

    const users = await User.find({});  // Retrieve all users from the database

    users.forEach(async user => {
      const userEmail = user.email;

      // Convert array of URLs to a string to send in the email body
      const urlsToSend = visitedUrls.join('\n');

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS
        }
      });

      try {
        await transporter.sendMail({
          from: '"SK" <subeomkwon@gmail.com>',
          to: userEmail,
          subject: "Your Daily List of URLs",
          text: `Here are your daily URLs related to your interests:\n${urlsToSend}`
        });
      } catch (err) {
        console.error(`Error sending email to ${userEmail}: ${err}`);
      }
    });
  } catch (err) {
    console.error(`Error in sending daily updates: ${err}`);
  }
}


app.listen(port, () => {
  console.log(`Server started and listening on port ${port}`)
});