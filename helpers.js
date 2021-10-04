// REQUIRED LIBRARIES ------------------------------------------------

const bcrypt = require('bcryptjs');

// FUNCTIONS ---------------------------------------------------------

/* Generate Random String */

const generateRandomString = () => Math.random().toString(36).substr(2, 6);

/* Registration Form Input Validity Checker */

const inputChecker = function(email, password) {
  if (!email || !password) {
    return false;
  }
  return true;
};

/* Get User By Email */

const getUserByEmail = function(email, database) {
  for (let user in database) {
    const userObject = database[user];
    if (email === userObject.email) {
      return userObject;
    }
  }
  return undefined;
};

/* Authenticate Password */

const authenticatePassword = (email, password, database) => {
  const userObject = getUserByEmail(email, database);
  if (userObject) {
    if (bcrypt.compareSync(password, userObject.password)) {
      return userObject;
    }
    return false;
  }
  return null;
};

/* Find User's URLs */

const urlsForUser = function(id, database) {
  const userUrls = {};
  for (let url in database) {
    const shortURL = database[url];
    if (shortURL.userID === id) {
      userUrls[url] = shortURL;
    }
  }
  return userUrls;
};

module.exports = {
  generateRandomString,
  inputChecker,
  getUserByEmail,
  authenticatePassword,
  urlsForUser
};