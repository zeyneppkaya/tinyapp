const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3000;
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = {
   b6UTxQ: {
    longURL: "https://lighthouselabs.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur")
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk")
  }
}


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>");
});

app.get('/urls', (req, res) => {
  const urls = urlsForUser(req.cookies["user_id"]);
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  if (!templateVars.user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies["user_id"]];
  const url = urlDatabase[req.params.shortURL];
  if (!user){
    res.redirect("/login", 403);
    return;
  }
  if (req.cookies["user_id"] !== url.userID){
    res.redirect("/urls" , 403);
    return;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: url.longURL,
    user
  };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  if (!url) {
    res.status(404).send("Link not found");
  }
  res.redirect(url.longURL);
});

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.status(403).send("Not authorized");
  } else {
    const shortUrl = generateRandomString(6);
    urlDatabase[shortUrl] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"]
    };
    res.redirect(`/urls/${shortUrl}`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  if (url.userID === req.cookies["user_id"]) {
    delete urlDatabase[req.params.shortURL];
  } else {
    return res.status(403).send("Not authorized");
  }
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  
  if(url.userID === req.cookies["user_id"]){
    urlDatabase[req.params.id].longURL = req.body.newURL;
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.status(403).send("Not authorized.")
  }
});

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = checkEmail(email);
  console.log(email);
  if (!user) {
    res.status(403).send('The E-mail or password is missing.');
  } else if (!bcrypt.compareSync(password, user.password)){
    res.status(403).send('The password is incorrect.');
  } else {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  };
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/');
});

app.post('/register', (req, res) => {
  let { email, password } = req.body;
  password = bcrypt.hashSync(password);
  
  if (!email || !password) {
    res.status(400).send('Email and/or password is missing.');
    return;
  }
  
  if (checkEmail(email)) {
    res.status(400).send('This email has already been registered.');
    return;
  }
  const userId = generateRandomString(6);
  const newUser = {
    id: userId,
    email,
    password,
  };
  users[userId] = newUser
  res.cookie('user_id', userId);
  res.redirect("/urls");
});

app.get("/register", (req,res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

function generateRandomString(num) {
  let randomStr = '';
  let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < num; i++ ) {
    randomStr += letters.charAt(Math.floor(Math.random() * 
    letters.length));
  }
  return randomStr;
};

const checkEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    } 
  }
  return false;
};

const urlsForUser = (id) => {
  let user = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      user[url] = urlDatabase[url];
    }
  }
  return user;
};
