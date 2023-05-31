const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb+srv://khan:GB9gahMHNQuZN72Q@chat-app.bkyiiri.mongodb.net/?retryWrites=true&w=majority", {
             useNewUrlParser: true ,
            useUnifiedTopology: true,
            
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit();
        
    }
}

module.exports = connectDB;