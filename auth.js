const jwtSecret = 'your_jwt_secret'; //This has to be the same key used in the JWTStrategy

    const jwt = require('jsonwebtoken'),
    passport = require('passport');

    require('./passport.js'); //The local passport file

let generateTWTToken = (user) => {
    return jwt.sign( user, jwtSecret, {
        subject: user.Username, // This is the username you're encoding in the JWT
        expiresIn: '7d', //This specifies that the token will expire in seven days
        algorithm: 'HS256' // This is the algorithim used to "sign" or encode the values of the JWT
    });
}

/*POST Login */
 module.exports = ( router ) => {
     router.post('.login', (req, res) => {
         passport.authenticate('local', { session: false},(error,user,info) =>  {
             if (error || !user) {
                 return res.status(400).json({
                     message: "Somethings not right here...",
                     user: user
                 });
             }
             req.login(user, { session: false }, (error) => {
                 if (error) {
                     res.send(error);
                 }
                 let token = generateTWTToken(user.tojson());
                 return res.json({ user, token });
             });
         })(req, res);
     });
 }