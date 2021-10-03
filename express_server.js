// REQUIRED LIBRARIES ------------------------------------------------

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

// SIMPLIFIED VARIABLES FOR EASE OF USE ------------------------------

const app = express();
const PORT = 8080;

// ENABLING EJS AS THE VIEW ENGINE -----------------------------------

app.set("view engine", "ejs");

// DATABASES ---------------------------------------------------------

/* Collection Of URLS */

const urlDatabase = {
  "b2xVn2": "https://www.lighthouselabs.ca",
  "9sm5xK": "https://www.google.com",
};

/* Collection Of Users */

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// MIDDLEWARE --------------------------------------------------------

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// FUNCTIONS ---------------------------------------------------------

/* Random String Generator */

const generateRandomString = () => Math.random().toString(36).substr(2, 6);

/* Valid E-mail/Password Checker */

const inputChecker = function(email, password) {
  if (!email || !password) {
    return false;
  }
};

/* Existing E-mail Checker */

const emailChecker = function(email, database) {
  for (let user in database) {
    const userId = database[user];
    if (email === userId.email) {
      return userId;
    }
  }
  return false;
};

/* Account authenticator */

const accountAuthenticator = (email, password, database) => {
  const user = emailChecker(email, database);
  if (user) {
    if (user.password === password) {
      return user;
    }
    return undefined;
  }
  return null;
};

// GET REQUESTS ------------------------------------------------------

/* Home Page */

app.get("/", (req, res) => {
  res.send("Hello!");
});

/* User Registration Page */

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies["user_id"]
  };
  res.render("user_registration", templateVars);
});

/* User Login Page */

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies["user_id"]
  };
  res.render("user_login", templateVars);
});

/* Complete URL List Page */

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies["user_id"]
  };
  res.render("urls_index", templateVars);
});

/* URL Creation Page */

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"]
  };
  res.render("urls_new", templateVars);
});

/* Single URL Page */

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

/* Redirect To External Site Using Shortened URL */

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

/* JSON Representation Of All Existing URLs */

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/* JSON Representation Of All Existing users */

app.get("/users.json", (req, res) => {
  res.json(users);
});


// POST REQUESTS -----------------------------------------------------

/* Register New User */

app.post("/register", (req, res) => {
  const id = "user_" + generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (inputChecker(email, password) === false) {
    res.status(400).send("Error: Cannot leave the e-mail or password fields empty.");
  } else if (emailChecker(email, users)) {
    res.status(400).send("Error: A user with this e-mail already exists.");
  } else {
    users[id] = {
      "id": id,
      "email": email,
      "password": password
    };
    res.cookie("user_id", users[id]);
    res.redirect("/urls");
  }
});

/* Login */

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = accountAuthenticator(email, password, users);
  if (user) {
    res.cookie("user_id", user);
    res.redirect("/urls");
  } else if (user === null) {
    res.status(403).send("Error: Incorrect e-mail.");
  } else if (user === undefined) {
    res.status(403).send("Error: Incorrect password.");
  }
});

/* Logout */

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

/* Create New URL */

app.post("/urls", (req, res) => {
  const newURL = generateRandomString();
  let longURL = req.body.longURL;
  if (!(longURL.includes('http'))) {
    longURL = `https://${longURL}`;
  }
  urlDatabase[newURL] = longURL;
  res.redirect(`/urls/${newURL}`);
});

/* Delete Existing URL */

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

/* Edit Existing URL */

app.post("/urls/:shortURL/edit", (req, res) => {
  let longURL = req.body.longURL;
  if (!(longURL.includes('http'))) {
    longURL = `https://${longURL}`;
  }
  urlDatabase[req.params.shortURL] = longURL;
  res.redirect("/urls");
});

// LISTEN METHOD ----------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});