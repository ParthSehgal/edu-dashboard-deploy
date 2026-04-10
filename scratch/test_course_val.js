const mongoose = require("mongoose");
const Course = require("./src/models/course.model");

async function test() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/edunexus"); // Use main DB
        console.log("Connected to DB");

        const course = new Course({
            courseId: "TEST-101",
            title: "Test Course",
            description: "Test Desc",
            instructor: new mongoose.Types.ObjectId(), // Fake ID
            department: "AI"
        });

        await course.validate();
        console.log("Course validation successful with department: 'AI'");
    } catch (err) {
        console.error("Validation failed:", err.message);
    } finally {
        await mongoose.connection.close();
    }
}

test();
