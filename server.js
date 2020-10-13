if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
// const bodyParser = require('body-parser');

//--------Importing All The routes Created--------
const indexRouter = require('./routes/index'); //For default display
const authorRouter = require('./routes/authors'); //For Authors Routing
const bookRouter = require('./routes/books'); //For Books Routing
//--------Importing All The routes Created--------

//--------Setting Application's Dfault Settings Engines and Paths--------
app.set('view engine' , 'ejs');
app.set('views' , __dirname + '/views');
app.set('layout' , 'layouts/layout');
app.use(expressLayouts);
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.urlencoded({limit: '10mb' , extended: false}));
// app.use(express.urlencoded({limit: '10mb' , extrended: false}));
//--------Setting Application's Dfault Engines and Paths--------

//--------Mongoose Connection--------
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL_TEST, {
useUnifiedTopology: true,
useNewUrlParser: true,
})

const db = mongoose.connection;
db.on('error' , error => console.error(error)); 
db.once('open'  , () => console.log('Connected to Mongoose'));
//--------Mongoose Connection--------

//--------Telling the Application to use which routes--------
app.use('/' , indexRouter);
app.use('/authors' , authorRouter);
app.use('/books' , bookRouter);
//--------Telling the Application to use which routes--------

app.listen(process.env.PORT || 3000);