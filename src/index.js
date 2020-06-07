const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const app = express()
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport')
require('./middleware/passport')(passport);
const path = require('path');


app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

app.use(
    session({
      secret: 'mySecret',
      resave: true,
      saveUninitialized: true
    })
  );

app.use(passport.initialize());
app.use(passport.session());

  app.use(flash());

  app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg', 'error_login_msg');

    res.locals.error = req.flash('error');
    next();
  });



const hbs = require('hbs');
const bodyparser = require('body-parser')
app.use(bodyparser.urlencoded({
    extended: true
}));
app.use(bodyparser.json());
app.set('views', path.join(__dirname, '/templates/views/'));

app.use(express.static(__dirname + '/public'));

const partialsPath = path.join(__dirname, './templates/partials'); 
hbs.registerPartials(partialsPath);


app.set('view engine', 'hbs')






const port = process.env.PORT || 3000

app.use(userRouter)


app.listen(port, () => {
    console.log('Server is up on port '+ port )
})