const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')

const app = express()

const dotenv = require('dotenv')
const { AsyncLocalStorage } = require('async_hooks')

dotenv.config({ path: './config.env' })

// View engine setup

// app.set('view engine', 'pug')
app.set(express.static(__dirname + '/public'))
app.use(express.static(__dirname))

// app.set('views', path.join(__dirname, 'views'))

// Body parser, reading data from body into req.body
// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.render(path.join(__dirname, 'views', 'base.pug'))
})

app.get('/gdpr', (req, res) => {
  res.render(path.join(__dirname, 'views', '_gdpr.pug'))
})

app.get('/tradeRules', (req, res) => {
  res.render(path.join(__dirname, 'views', '_tradeRules.pug'))
})

app.get('/projects', (req, res) => {
  res.render(path.join(__dirname, 'views', '_projects.pug'))
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server started on port: ${PORT}`))

// turnstile
const SECRET_KEY = process.env.TURN_SECRET

async function handlePost(request) {
  const body = await request.formData()
  // Turnstile injects a token in "cf-turnstile-response".
  const token = body.get('cf-turnstile-response')
  const ip = request.headers.get('CF-Connecting-IP')

  // Validate the token by calling the
  // "/siteverify" API endpoint.
  let formData = new FormData()
  formData.append('secret', SECRET_KEY)
  formData.append('response', token)
  formData.append('remoteip', ip)

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
  const result = await fetch(url, {
    body: formData,
    method: 'POST',
  })

  const outcome = await result.json()
  if (outcome.success) {
    // ...
    console.log(outcome)
  }
}

app.post('/send', (req, res) => {
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
    <p>DVL Construct</p>
    
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
    from: `DVL Construct <${process.env.EMAIL_FROM}>`, // sender address
    to: `${req.body.email}`,
    bcc: 'info@pictusweb.sk',
    // list of receivers
    subject: 'DVL Construct Kontakt', // Subject line
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
})
