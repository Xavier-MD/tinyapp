const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email if that user exists in the database', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });
  it('should return undefined if the user email does not exist in the database', function() {
    const user = getUserByEmail("littlebigchamp@example.com", testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });
  it('should return undefined if the argument provided for email is an empty string', function() {
    const user = getUserByEmail("", testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });
  it('should return undefined if the argument provided for email lacks an "@"', function() {
    const user = getUserByEmail("userhotmail.com", testUsers);
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });
});