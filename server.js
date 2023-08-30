const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');
const schedule = require('node-schedule');
const app = express();

require('dotenv').config();

const port = 5000;

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

const seed_urls = [
    "https://www.google.com/search?q=hallyu&sca_esv=557985309&biw=2752&bih=1035&tbm=nws&sxsrf=AB5stBgKqi21sC-tjyvGvq0HPlkOVtxNkg%3A1692328603589&ei=m-LeZJvLI6-A2roP3sejiAE&ved=0ahUKEwjbhIqqn-WAAxUvgFYBHd7jCBEQ4dUDCA0&uact=5&oq=hallyu&gs_lp=Egxnd3Mtd2l6LW5ld3MiBmhhbGx5dTIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBxAAGIoFGEMyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABEirHVDlBljfGnAEeACQAQGYAf4BoAGoC6oBBjAuMTEuMbgBA8gBAPgBAagCAMICCxAAGIAEGLEDGIMBwgIEEAAYA8ICCBAAGIAEGLEDwgIIEAAYigUYkQLCAgcQABiABBgKiAYB&sclient=gws-wiz-news",
    "https://www.google.com/search?q=korean+wave&sca_esv=557985309&biw=2752&bih=1035&tbm=nws&sxsrf=AB5stBic0jwmONmUIu0lf5sm4xr7dTXMLg%3A1692328618222&ei=quLeZIyHDaul2roPmeeA2Ag&ved=0ahUKEwiMhIexn-WAAxWrklYBHZkzAIsQ4dUDCA0&uact=5&oq=korean+wave&gs_lp=Egxnd3Mtd2l6LW5ld3MiC2tvcmVhbiB3YXZlMgUQABiABDIFEAAYgAQyBxAAGIoFGEMyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESPUMULMEWO4LcAF4AJABAJgBd6ABmAmqAQMyLjm4AQPIAQD4AQGoAgCIBgE&sclient=gws-wiz-news",
    "https://www.google.com/search?q=k-pop&sca_esv=557985309&biw=2752&bih=1035&tbm=nws&sxsrf=AB5stBgsC_77yOw8R70ZByovNpPsW9l_PQ%3A1692328635175&ei=u-LeZJufCrTd2roP0KWfsAw&ved=0ahUKEwjb6JG5n-WAAxW0rlYBHdDSB8YQ4dUDCA0&uact=5&oq=k-pop&gs_lp=Egxnd3Mtd2l6LW5ld3MiBWstcG9wMggQABiKBRiRAjIIEAAYigUYkQIyBxAAGIoFGEMyBxAAGIoFGEMyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgARI5yFQmwpYvh5wA3gAkAEAmAF8oAGRB6oBAzAuOLgBA8gBAPgBAagCAIgGAQ&sclient=gws-wiz-news",
    "https://www.google.com/search?q=%EC%BC%80%EC%9D%B4%ED%8C%9D&sca_esv=557985309&biw=2752&bih=1035&tbm=nws&sxsrf=AB5stBjn6CZ1IBsOosjSXvG2ab5JDgWtfQ%3A1692328658405&ei=0uLeZI6eGPe22roP9OOTyAI&ved=0ahUKEwiOz5vEn-WAAxV3m1YBHfTxBCkQ4dUDCA0&uact=5&oq=%EC%BC%80%EC%9D%B4%ED%8C%9D&gs_lp=Egxnd3Mtd2l6LW5ld3MiCey8gOydtO2MnTILEAAYgAQYsQMYgwEyCxAAGIAEGLEDGIMBMgsQABiABBixAxiDATIFEAAYgAQyBxAAGIoFGEMyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABEiWnAFQ5oABWPSaAXAEeACQAQKYAcoBoAGiCKoBBTEuNy4xuAEDyAEA-AEBqAIAwgIIEAAYigUYkQLCAggQABiABBixA4gGAQ&sclient=gws-wiz-news",
    "https://www.google.com/search?q=korean+entertainment&sca_esv=557985309&biw=2752&bih=1035&tbm=nws&sxsrf=AB5stBjFHL2wwksEtS-HmBF2MGIMo60ogw%3A1692328679740&ei=5-LeZMjULKDh2roPk8Sz6AQ&oq=korean+enter&gs_lp=Egxnd3Mtd2l6LW5ld3MiDGtvcmVhbiBlbnRlcioCCAAyCBAAGIoFGJECMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESNB0UI82WKlucAV4AJABAJgB-gGgAYgOqgEGMi4xMi4xuAEDyAEA-AEBqAIAwgILEAAYgAQYsQMYgwHCAgQQABgDwgIIEAAYgAQYsQOIBgE&sclient=gws-wiz-news",
    "https://www.google.com/search?q=k-drama&sca_esv=557985309&biw=2752&bih=1035&tbm=nws&sxsrf=AB5stBjzfOzNVnk5Yq08CxJM5VIKLGaxtA%3A1692328707149&ei=A-PeZJrZCODK2roPy9Cf8AY&ved=0ahUKEwja5rrbn-WAAxVgpVYBHUvoB24Q4dUDCA0&uact=5&oq=k-drama&gs_lp=Egxnd3Mtd2l6LW5ld3MiB2stZHJhbWEyBRAAGIAEMgUQABiABDIFEAAYgAQyBxAAGIoFGEMyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIHEAAYigUYQ0iYElD1BFjqEXABeACQAQCYAXegAZwFqgEDMC42uAEDyAEA-AEBqAIAwgIIEAAYigUYkQKIBgE&sclient=gws-wiz-news",
];

const job = schedule.scheduleJob('52 11 * * *', function() {
  sendDailyUpdates();
});

async function sendDailyUpdates() {
  try {
    // Read URLs from the JSON file
    const rawData = fs.readFileSync('url_lists.json', 'utf-8');
    let visitedUrls = JSON.parse(rawData);

    // Remove seed URLs from the list
    visitedUrls = visitedUrls.filter(urlData => !seed_urls.includes(urlData.url));

    const users = await User.find({});  // Retrieve all users from the database

    users.forEach(async user => {
      const userEmail = user.email;

      // Convert array of dictionaries to a string with hyperlinks to send in the email body
      const urlsToSend = visitedUrls.map(urlData => {
        return `<a href="${urlData.url}">${urlData.title || "untitled"}</a><br>`;
      }).join('');

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
          html: `Here are your daily URLs related to your interests:<br><br>${urlsToSend}`
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