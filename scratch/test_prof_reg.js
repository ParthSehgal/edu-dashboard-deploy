const mongoose = require("mongoose");
const User = require("./src/models/user.model");
const bcrypt = require("bcryptjs");

async function test() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/edunexus_test"); // Use a test DB
        console.log("Connected to test DB");

        const email = "name_2401ai54@iitp.ac.in";
        const role = "professor";
        const department = "AI";

        // Check if user exists
        const exists = await User.findOne({ email });
        if (exists) {
            console.log("User already exists, deleting for test...");
            await User.deleteOne({ email });
        }

        const user = await User.create({
            name: "Test Prof",
            collegeId: "PROF_AI_01",
            email: email,
            password: "password123",
            role: role,
            department: department
        });

        console.log("User created successfully:", user.email);

    } catch (err) {
        console.error("Creation failed!");
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
}

test();
