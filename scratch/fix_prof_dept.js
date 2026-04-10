const mongoose = require("mongoose");
const User = require("./src/models/user.model");
mongoose.connect('mongodb://127.0.0.1:27017/edtech').then(async () => { 
    await User.updateMany({role: 'professor', department: 'Unknown'}, {$set: {department: 'Electrical'}}); 
    console.log('Updated professors to Electrical'); 
    process.exit(0); 
});
