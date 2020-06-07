
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
      console.log(errors);
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
    })

/* function insertRecord(req, res) {
    var user = new User();
    user.fullname = req.body.fullname;
    user.email = req.body.email;
    user.password = req.body.password;
 
    try {
        user.generateAuthToken();
        user.save((err, doc) =>{
            res.redirect('/login');
        });

        //res.redirect('');
        //res.status(201).send({user, token})
        //console.log(res.send({user, token}))
        
        console.log(req.body);
    } catch (e) {
        res.status(400).send(e)
    } 
}
 */

function handleValidationError(err, body) {
    for (field in err.errors) {
        switch (err.errors[field].path) {
            case 'fullName':
                body['fullNameError'] = err.errors[field].message;
                break;
            case 'email':
                body['emailError'] = err.errors[field].message;
                break;
            default:
                break;
        }
    }
}

/* router.get('/users/me', auth, async (req, res) => {
    console.log(req.mail)
        
    res.render('private', {
       name: req.mail});

})
 */

router.post('/users/login', async (req, res, next) => {
  
    /* try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.cookie('auth_token', token)
        const email = req.body.email
        //res.sendFile(path.resolve(__dirname, '..', 'templates' ,'views', 'private.hbs'))
        res.status(201).redirect('/dashboard')

    } catch (e) {
        res.status(400).redirect('/?' + JSON.stringify('Invalid email or password.'))
        handleValidationError(err, req.body)
    } */
    const user = User(req.body)
    const { email, password} = user
    let errors = [];
    console.log( req.flash('loginMessage') );
    if (!email || !password ) {
        errors.push({ msg: 'Please enter all fields' });
      }
      if(!user){
        errors.push({ msg: 'Please dont work' });
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


/* router.post('/users/logout',  async (req, res) => {
    const cookie = req.cookies;
    for (var prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }    
        res.cookie(prop, '', {expires: new Date(0)});
    }
    req.user.tokens = []
	await req.user.save()
    res.redirect('/');
    
}) */
/*     try {
         req.user.tokens = []
        req.session.destroy() 
        

       // await req.user.save()
        
        await res.redirect('/') */
       /*  req.session = null // deletes the cookie
		req.session.destroy() 
 */
		// Terminates user's session - seems unnecessary for now, but here just in case
			// req.session = null // deletes the cookie
			// req.session.destroy() // ends session after redirected to index.html
/* 	} catch (e) {
		res.status(500).send()
	} */

/* 
router.delete('/profile:id', auth, async (req, res) => {
    console.log("sada")
	const authenticated = await bcrypt.compare(req.body.password, req.user.password)
	try {

		if (authenticated) { // If password is valid
			await req.user.remove()
			// res.send(req.user)
			res.redirect('/')
		} else {
			throw e()
		}

	} catch (e) {
		res.status(500).redirect('/settings?' + JSON.stringify('deletion'))
	}

}) */

 /*    res.status(200);
    res.redirect('/users/me'); */


/*     try{
        const token = await user.generateAuthToken();
            const user = await User.findByCredentials(req.body.email, req. body.password)
        res.send({user, token})
    }
    catch(error){
        res.status(400).send()

    } */
    router.get('*', (req, res)=>{
        res.render('404page')    
    })

module.exports = router