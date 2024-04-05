const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const collection = require('./config');
const { error } = require('console');


const app = express();

app.use(express.json());

app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("login");
})

app.get("/signup", (req, res) => {
    res.render("signup");
})

app.post("/signup", async (req, res) => {
    const data = {
        name : req.body.username,
        password: req.body.password 
    }

    const existingUser = await collection.findOne({name: data.name});

    if(existingUser){
        // res.send("User already exists, try another name")
        return res.render("signup", { error: "Username already exists. Please try another name!", username: req.body.username });
    }
    else{
        //hashing the password using bcrypt
        const saltRounds = 10;//no. of salt round for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;

        const userdata = await collection.insertMany(data);
        console.log(userdata);

        res.render("home", { username: data.name });
    }
})

app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        
        if (!check) {
            return res.render("login", { error: "Username not found", username: req.body.username });
        }
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        
        if (!isPasswordMatch) {
            return res.render("login", { error: "Wrong password", username: req.body.username });
        } else {
            return res.render("home", { username: req.body.username });
        }
    } catch {
        return res.render("login", { error: "Wrong details", username: req.body.username });
    }
});

// // Render login page with no error message when accessed directly
// app.post("/login", (req, res) => {
//     res.render("login", { error: "", username: "" });
// });

const port = 5000;
app.listen(port, () => {
    console.log(`server running on port: ${port}`);
})
