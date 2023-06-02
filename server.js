if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}


// Importing Libraies that we installed using npm
const express = require("express")
const app = express()
const bcrypt = require("bcrypt") // Importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )



const users = []

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // We wont resave the session variable if nothing is changed
    saveUninitialized: false
}))
app.use(passport.initialize()) 
app.use(passport.session())
app.use(methodOverride("_method"))

// Configuring the register post functionality
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/account",
    failureRedirect: "/login",
    failureFlash: true
}))

// Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async (req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(), 
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        console.log(users); // Display newly registered in the console
        res.redirect("/login")
        
    } catch (e) {
        console.log(e);
        res.redirect("/register")
    }
})

// Routes
app.get('/', checkAuthenticated, (req, res) => {
    res.render("index.ejs", {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})
// End Routes

// app.delete('/logout', (req, res) => {
//     req.logOut()
//     res.redirect('/login')
//   })

app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}


const fs = require('fs');  

const dataPath = './Details/useraccount.json' 

// util functions 

const saveAccountData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync(dataPath, stringifyData)
}

const getAccountData = () => {
    const jsonData = fs.readFileSync(dataPath)
    return JSON.parse(jsonData)    
}


// reading the data
app.get('/account', (req, res) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        throw err;
      }
      res.render("index.ejs", {"data":JSON.parse(data)})
    });
  });

  app.post('/account/addaccount', (req, res) => {
   
        var existAccounts = getAccountData()
        const newAccountId = Math.floor(100000 + Math.random() * 900000)
       
        existAccounts[newAccountId] = req.body
         
        console.log(existAccounts);
    
        saveAccountData(existAccounts);
        res.redirect("/account");
        
    });
    app.post('/account/:id', (req, res) => {
        var existAccounts = getAccountData()
        fs.readFile(dataPath, 'utf8', (err, data) => {
         const accountId = req.params['id'];
         existAccounts[accountId] = req.body;
         console.log(existAccounts);
         saveAccountData(existAccounts);
         
         
         
         res.redirect("/account");
       }, true);
       
     });
     app.post('/account/delete/:id', (req, res) => {
        fs.readFile(dataPath, 'utf8', (err, data) => {
         var existAccounts = getAccountData()
     
         const userId = req.params['id'];
     
         delete existAccounts[userId];  
         saveAccountData(existAccounts);
         
         res.redirect("/account")
       }, true);
     })
app.listen(5000)



//   

// // Read - get all accounts from the json file
// app.get('/account/list', (req, res) => {
//   const accounts = getAccountData()
//   res.send(accounts)
// })

// Update - using Put method


// //delete - using delete method
