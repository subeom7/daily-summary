const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();


require('dotenv').config();

const port = 5000;

const connectionString = process.env.MONGO_CONNECTION

app.use(cors());
app.use(express.json()); // Built-in middleware to parse incoming json

app.get('/', (req, res) => {
  res.send('Hello World!')
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
