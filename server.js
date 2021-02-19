const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const app = express()

mongoose.connect('mongodb+srv://root:root@cluster0.krm1f.mongodb.net/testdb?retryWrites=true&w=majority', {
  useNewUrlParser:true,
  useUnifiedTopology: true
}).then(console.log("hello"))

app.set('view engine',  'ejs')

app.use(express.urlencoded({ extended: false }))

app.get('/', async(req, res)=>{
  const shortUrls = await ShortUrl.find()
  console.log(shortUrls)
  res.render('index', { shortUrls: shortUrls })
})

app.post('/shortUrls', async(req, res) => {
 await ShortUrl.create({full: req.body.fullUrl })
 res.redirect('/')
})

app.listen(process.env.PORT || 5000);