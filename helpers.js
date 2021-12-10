// FUNCTIONS

const getUserByEmail = (email, users) => {
    for (let user in users) {
        if (users[user].email === email) {
            return users[user];
        }
    }
    return undefined;
};

const urlsForUser = (id, urlDatabase) => {
    let user = {};
    for (let url in urlDatabase) {
        if (urlDatabase[url].userID === id) {
            user[url] = urlDatabase[url];
        }
    }
    return user;
};

function generateRandomString(num) {
    let randomStr = '';
    let letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < num; i++) {
        randomStr += letters.charAt(Math.floor(Math.random() *
            letters.length));
    }
    return randomStr;
};



module.exports = { getUserByEmail, urlsForUser , generateRandomString };