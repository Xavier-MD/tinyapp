// REQUIRED LIBRARIES

const express = require("express");
const bodyParser = require("body-parser");

// SIMPLIFIED VARIABLES FOR EASE OF USE

const app = express();
const PORT = 8080;

// ENABLING EJS AS THE VIEW ENGINE

app.set("view engine", "ejs");

// FUNCTION THAT CREATES UNIQUE 6 CHARACTER IDENTIFIERS

const generateRandomString = () => Math.random().toString(36).substr(2, 6);

// COLLECTION OF ALL URLS

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// MIDDLEWARE BODY PARSER

app.use(bodyParser.urlencoded({extended: true}));

// GET REQUESTS

/* Home Page */

app.get("/", (req, res) => {
  res.send("Hello!");
});

/* Complete URL List Page */

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

/* URL Creation Page */

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

/* Single URL Page */

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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

// POST REQUESTS

/* Create New URL */

app.post("/urls", (req, res) => {
  const updatedURL = generateRandomString();
  let longURL = req.body.longURL;
  if (!(longURL.includes('http'))) {
    longURL = `https://${longURL}`;
  }
  urlDatabase[updatedURL] = longURL;
  res.redirect(`/urls/${updatedURL}`);
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

// LISTEN METHOD

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});