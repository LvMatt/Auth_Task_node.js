
const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const path = require('path');
const hbs = require('hbs');
//const auth = require('../middleware/authentication')
const app = express()
const viewsPath = path.join(__dirname, '../templates/views')
const passport = require('passport');
app.set('view engine', 'hbs')
app.set('views', viewsPath)
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/authentication');

/* 
//const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials');

//app.use(express.static(publicDirectoryPath))
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath);

 */
router.get('/', forwardAuthenticated , (req, res)=>{
    if(req.url)
    res.render('index', {
        title: 'Intro Page',
        name: 'DogFinder app',
        author: 'Matus Kalanin'
    })})


    router.get('/register', (req, res)=>{
        res.render('register', {
            title: 'Intro Page',
            name: 'DogFinder app',
            author: 'Matus Kalanin'
        })    
    })

     
    router.get('/dashboard', ensureAuthenticated, (req, res) => {
        console.log(req.user.email)
        
        res.render('private', {
            user: req.user});
    })
 
    router.post('/users/register', async (req, res) => {
        const user = new User(req.body)
      const { fullname, email, password} = user
      let errors = [];

      if (!fullname || !email || !password ) {
        errors.push({ msg: 'Please enter all fields' });
      }
      if (errors.length > 0) {
        res.render('register', {
          errors,
          fullname,
          email,
          password,
        });
      }

   
      if(req.body.email === user.email){
          console.log("Error")
         req.flash(
            'error',
            'Email exists already'
          ); 
          res.status(201).redirect('/register')
      }
      else{

        try {
            await user.save()
            const token = await user.generateAuthToken()
            res.cookie('auth_token', token)
            req.flash(
                'success_msg',
                'You are now registered and can log in'
              );            
              res.status(201).redirect('/')
        } catch (e) {
        }
    }
    })




router.post('/users/login', async (req, res, next) => {
  
    const user = User(req.body)
    const { email, password} = user
    let errors = [];
    console.log( req.flash('loginMessage') );
    if (!email || !password ) {
        errors.push({ msg: 'Please enter all fields' });
      }

      console.log(errors)
      if (errors.length > 0) {
        res.render('index', {
          errors,
          email,
          password,
        });
      }
      else{
        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: ('/' ),
            failureFlash: true,
          })(req, res, next);
      }
})

router.get('/users/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });
  
  router.get('/delete',  async (req, res) => {

			await req.user.remove()
			// res.send(req.user)
			res.redirect('/')
})

    router.get('*', (req, res)=>{
        res.render('404page')    
    })

module.exports = router