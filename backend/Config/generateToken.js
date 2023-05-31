const jwt = require('jsonwebtoken');

const generateToken = (id) => {
     //1st parameter Id, 2nd secret key, 3rd expire in duration
    return jwt.sign({id},"Takbeer",{ expiresIn:"30d"});

};

module.exports = generateToken;