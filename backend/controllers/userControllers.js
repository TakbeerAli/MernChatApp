const asyncHandler = require('express-async-handler')
const User = require('../models/userModel');
const generateToken = require('../Config/generateToken');

const registerUser = asyncHandler(async (req, res) => {
    const { name,
        email,
        password, pic } = req.body;   

   console.log(name, email, password, pic );
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

    //if user already exist in database
    const userExists = await User.findOne({ email });
    if(userExists){
        res.status(400);
        throw new Error("User already Exits please login");
    };


    // if user are new 

    const user = await User.create({
        name,
        email,
        password,
        pic
    });

    if(user){
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            pic:user.pic,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error("Faild to create the user");
    }
});


// End-point for user Login

const authUser = asyncHandler(async(req, res) => {
const { email, password } = req.body;

const user = await User.findOne({email});

if(user && (await user.matchPassword(password)) ){
    res.json({
        _id:user._id,
        name:user.name,
        email:user.email,
        pic:user.pic,
        token: generateToken(user._id)
    });
} else {
    res.status(400);
    throw new Error("Invalid user name and password");
}

});


// controleer for geting data
const allUser = asyncHandler(async(req, res) => {
    const keyword = req.query.search 
    ? {
        $or:[
            {name:{ $regex: req.query.search, $options: "i"}},
            {email: {$regex: req.query.search, $options: 'i'}},
        ],
    } :{};
     
    // this logic mean send all user but not currently logined user [ $ne ] mean not equal
    const users = await User.find(keyword).find({_id: {$ne: req.user._id }});
    // 
    res.send(users);
    console.log(keyword);

});
module.exports = {registerUser, authUser, allUser};