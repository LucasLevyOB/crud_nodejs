const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;

const users = [{
    _id: 1,
    username: 'usuario',
    password: '$2a$06$HT.EmXYUUhNo3UQMl9APmeC0SwoGsx7FtMoAWdzGicZJ4wR1J8alW'
},{
    _id: 2,
    username: 'admin',
    password: '$2y$12$AKWML.llJA5VpU69bVAKDe9BmVleoTZ44fY9jCzF5G9dNzKyzB9ky'
}];

module.exports = function(passport) {
    function findUser(username) {
        return users.find(item => item.username === username);
    }

    function findUserById(id) {
        return users.find(item => item._id === id);
    }

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        try {
            const user = findUserById(id);
            done(null, user);
        } catch(error) {
            console.log(error);
            return done(error, null);
        }
    });

    passport.use(new LocalStrategy({
        usernameField: 'user',
        passwordField: 'password'
    }, (username, password, done) => {
        try {
            const user = findUser(username);
            if(!user) return done(null, false, { message: 'Combinação usuário e senha inválidos.' });
            const isValid = bcrypt.compareSync(password, user.password);
            if(!isValid) return done(null, false, { message: 'Combinação usuário e senha inválidos.' });
            return done(null, user);
        } catch(error) {
            console.log(error);
            return done(error, false);
        }
    }));

}
