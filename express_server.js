// REQUIRED LIBRARIES ------------------------------------------------

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const helpers = require('./helpers');

// VARIABLES ---------------------------------------------------------

const app = express();
const PORT = 8080;

// SET EJS AS VIEW ENGINE --------------------------------------------

app.set("view engine", "ejs");

// MIDDLEWARE --------------------------------------------------------

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['superSecretCookies'],
}));

// DATABASES ---------------------------------------------------------

/* URL Database */

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

/* User Database */

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

// GET REQUEST HANDLERS ----------------------------------------------

/* Hello Page */

app.get("/", (req, res) => {
  const currentUser = req.session.user_id;
  if (currentUser) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

/* Hello World Page */

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

/* User Registration Page */

app.get("/register", (req, res) => {
  const currentUser = req.session.user_id;
  const templateVars = {
    user: currentUser
  };
  res.render("user_registration", templateVars);
});

/* User Login Page */

app.get("/login", (req, res) => {
  const currentUser = req.session.user_id;
  const templateVars = {
    user: currentUser
  };
  res.render("user_login", templateVars);
});

/* User URL List Page */

app.get("/urls", (req, res) => {
  const currentUser = req.session.user_id;
  if (currentUser) {
    const templateVars = {
      urls: helpers.urlsForUser(currentUser.id, urlDatabase),
      user: currentUser
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send("<html><body>Error: Users must register or login before accessing URLs. Please visit http://localhost:8080/register or http://localhost:8080/login.</body></html>\n");
  }
});

/* User URL Creation Page */

app.get("/urls/new", (req, res) => {
  const currentUser = req.session.user_id;
  if (currentUser) {
    const templateVars = {
      user: currentUser
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

/* User Single URL Page */

app.get("/urls/:shortURL", (req, res) => {
  const currentUser = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (currentUser) {
    if (currentUser.id === urlDatabase[shortURL].userID) {
      if (urlDatabase[shortURL]) {
        const longURL = urlDatabase[shortURL].longURL;
        const templateVars = {
          shortURL,
          longURL,
          user: currentUser
        };
        res.render("urls_show", templateVars);
      } else {
        res.status(404).send("<html><body>Error: The page you are trying to reach does not exist.</body></html>\n");
      }
    } else {
      res.status(403).send("<html><body>Error: Users can only edit URLs that they have created.</body></html>\n");
    }
  } else {
    res.status(403).send("<html><body>Error: Users must register or login before accessing URLs. Please visit http://localhost:8080/register or http://localhost:8080/login.</body></html>\n");
  }
});

/* Redirect To External Site */

app.get("/u/:shortURL", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  if (shortURL) {
    res.redirect(shortURL.longURL);
  } else {
    res.status(404).send("<html><body>Error: The page you are trying to reach does not exist.</body></html>\n");
  }
});

/* View URL Database */

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/* View User Database */

app.get("/users.json", (req, res) => {
  res.json(users);
});


// POST REQUEST HANDLERS --------------------------------------------

/* Register New User */

app.post("/register", (req, res) => {
  const id = "user_" + helpers.generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!helpers.inputChecker(email, password)) {
    res.status(400).send("<html><body>Error: Cannot leave the e-mail or password fields empty.</body></html>\n");
  } else if (helpers.getUserByEmail(email, users)) {
    res.status(400).send("<html><body>Error: A user with this e-mail already exists.</body></html>\n");
  } else {
    users[id] = {
      "id": id,
      "email": email,
      "password": hashedPassword
    };
    // eslint-disable-next-line camelcase
    req.session.user_id = users[id];
    res.redirect("/urls");
  }
});

/* Login */

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const currentUser = helpers.authenticatePassword(email, password, users);
  if (currentUser) {
    // eslint-disable-next-line camelcase
    req.session.user_id = currentUser;
    res.redirect("/urls");
  } else if (currentUser === null) {
    res.status(403).send("<html><body>Error: Incorrect email.</body></html>\n");
  } else if (currentUser === false) {
    res.status(403).send("<html><body>Error: Incorrect password.</body></html>\n");
  }
});

/* Logout */

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

/* Create New URL */

app.post("/urls", (req, res) => {
  const currentUser = req.session.user_id;
  if (currentUser) {
    const newURL = helpers.generateRandomString();
    let longURL = req.body.longURL;
    if (!(longURL.includes('http'))) {
      longURL = `https://${longURL}`;
    }
    urlDatabase[newURL] = {
      'longURL': longURL,
      'userID': currentUser.id
    };
    res.redirect(`/urls/${newURL}`);
  } else {
    res.status(403).send("<html><body>Error: User must be logged in to create a new URL.</body></html>\n");
    
  }
});

/* Delete Existing URL */

app.post("/urls/:shortURL/delete", (req, res) => {
  const currentUser = req.session.user_id;
  const shortURL = urlDatabase[req.params.shortURL];
  if (!shortURL) {
    res.status(404).send("<html><body>Error: The page you are trying to reach does not exist.</body></html>\n");
  } else if (currentUser && currentUser.id === shortURL.userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("<html><body>Error: Error: Users can only delete URLs that they have created.</body></html>\n");
  }
});

/* Edit Existing URL */

app.post("/urls/:shortURL/edit", (req, res) => {
  const currentUser = req.session.user_id;
  const shortURL = urlDatabase[req.params.shortURL];
  if (!shortURL) {
    res.status(404).send("<html><body>Error: The page you are trying to reach does not exist.</body></html>\n");
  }
  if (currentUser && currentUser.id === shortURL.userID) {
    let longURL = req.body.longURL;
    if (!(longURL.includes('http'))) {
      longURL = `https://${longURL}`;
    }
    urlDatabase[req.params.shortURL] = {
      'longURL': longURL,
      'userID': currentUser.id
    };
    res.redirect("/urls");
  } else {
    res.status(403).send("<html><body>Error: Error: Users can only edit URLs that they have created.</body></html>\n");
  }
});

// LISTEN METHOD ----------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});