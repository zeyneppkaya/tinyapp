// REQUIREMENTS

const express = require("express");
const cookieSession = require('cookie-session');
const { getUserByEmail, urlsForUser , generateRandomString } = require('./helpers');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["secretkeys"],
  maxAge: 24 * 60 * 60 * 1000
}));


// DATABASES

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
};


// ROUTES

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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
  const urls = urlsForUser(req.session["user_id"], urlDatabase);
  let templateVars = {
    user: users[req.session["user_id"]],
    urls
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  if (!templateVars.user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.session["user_id"]];
  const url = urlDatabase[req.params.shortURL];
  if (!user) {
    res.redirect("/login", 403);
    return;
  }
  if (req.session["user_id"] !== url.userID) {
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
  } else {
    res.redirect(url.longURL);
  }
});

app.post("/urls", (req, res) => {
  if (!req.session["user_id"]) {
    res.status(403).send("Not authorized");
  } else {
    const shortUrl = generateRandomString(6);
    urlDatabase[shortUrl] = {
      longURL: req.body.longURL,
      userID: req.session["user_id"]
    };
    res.redirect(`/urls/${shortUrl}`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  if (url.userID === req.session["user_id"]) {
    delete urlDatabase[req.params.shortURL];
  } else {
    return res.status(403).send("Not authorized");
  }
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  
  if (url.userID === req.session["user_id"]) {
    urlDatabase[req.params.id].longURL = req.body.newURL;
    res.redirect(`/urls/${req.params.id}`);
  } else {
    res.status(403).send("Not authorized.");
  }
});

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.session["user_id"]] };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!user) {
    res.status(403).send('The E-mail or password is missing.');
  } else if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send('The password is incorrect.');
  } else {
    req.session["user_id"] = user.id;
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  req.session['user_id'] = '';
  res.redirect('/urls/');
});

app.post('/register', (req, res) => {
  let { email, password } = req.body;
  password = bcrypt.hashSync(password);
  
  if (!email || !password) {
    res.status(400).send('Email and/or password is missing.');
    return;
  }
  
  if (getUserByEmail(email , users)) {
    res.status(400).send('This email has already been registered.');
    return;
  }
  const userId = generateRandomString(6);
  const newUser = {
    id: userId,
    email,
    password,
  };
  users[userId] = newUser;
  req.session['user_id'] = userId;
  res.redirect("/urls");
});

app.get("/register", (req,res) => {
  let templateVars = { user: users[req.session["user_id"]] };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

