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
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual( user.id, expectedUserID);
  });

  it('should return undefined if an email is not in our users database', function() {
    const user = getUserByEmail("user@thatdoesnotexist.com", testUsers)
    const expected = undefined;
    assert.strictEqual(user, expected);
  });

});
