require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const express = require('express')

const app = express()

app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.use('/user', require('./routes/userRoute'))

const URI = process.env.MONGODB_URL

mongoose.connect(URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if(err) throw err
    console.log('Вы подключены к MongoDB...');
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Сервер запущен на порте ${PORT}`);
})