const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')

// View engine setup

const app = express()
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

const dotenv = require('dotenv')
const { AsyncLocalStorage } = require('async_hooks')

dotenv.config({ path: './.config.env' })

app.set(express.static(__dirname + '/public'))
app.use(express.static(__dirname))

// Body parser, reading data from body into req.body
// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const sec01 = process.env.TURN_SECRET
const sec02 = process.env.TURN_SITE
let clicks = 0

app.get('/', (req, res) => {
  res.status(200).render('base', {
    sec01: sec01,
    sec02: sec02,
    clicks: clicks,
  })
})

app.get('/gdpr', (req, res) => {
  res.status(200).render('_gdpr')
})

app.get('/tradeRules', (req, res) => {
  res.status(200).render('_tradeRules')
})

app.get('/projects', (req, res) => {
  res.status(200).render('_projects')
})

app.get('/counter', (req, res) => {
  res.status(200).render('_counter', {
    counter: clicks,
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server started on port: ${PORT}`))

app.post('/send', (req, res) => {
  if (req.body.password1 === sec01 && req.body.password2 === sec02) {
    const output = `
    <h1>Vaša správa</h1>
    <h2>Kontaktné údaje</h2>
    <ul>
      <li>Meno: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
      <li>Telefón: ${req.body.phone}</li>
    </ul>
    <h2>Text správy:</h2>
    <h3>${req.body.message}</h3>
    <h2>Ďakujeme Vám za správu, budeme Vás kontaktovať telefonicky.</h2>
    <p>kvalitnamontaz.sk</p>
  `

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      pool: true,
      host: 'email.active24.com',
      port: 465,
      secure: true, // use TLS
      auth: {
        user: process.env.NODEJS_USERNAME,
        pass: process.env.NODEJS_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    // setup email data with unicode symbols
    let mailOptions = {
      from: `kvalitnamontaz.sk <${process.env.EMAIL_FROM}>`, // sender address
      to: `${req.body.email}`,
      bcc: 'info@pictusweb.sk',
      // list of receivers
      subject: 'kvalitnamontaz.sk Kontakt', // Subject line
      text: 'Hello world?', // plain text body
      html: output, // html body
    }

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error)
      }
      console.log('Message sent: %s', info.messageId)
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)),
        // smooth scroll to element and align it at the bottom

        res.render(path.join(__dirname, 'views', 'base.pug'), {
          msg: 'Vaša správa bola odoslaná',
        })
    })
  } else {
    clicks = clicks + 1
    res.render(path.join(__dirname, 'views', 'base.pug'), {
      warning: 'Neodoslané, kontaktujte nás telefonicky alebo mailom!',
      clicks: clicks,
    })
  }
})
