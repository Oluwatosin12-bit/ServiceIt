const express = require('express');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();
var cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const PORT = 3000
app.use(express.json());
app.use(cors());


app.post("/create", async (req, res) => {
    const {UserName, Password, FirstName, LastName, email} = req.body;
    bcrypt.hash(Password, saltRounds, async function(err, hashed) {
        try {
            await prisma.users.create({
                data : {
                    UserName,
                    FirstName,
                    LastName,
                    email,
                    Password: hashed
                }
            });
            res.status(200).json({});
        } catch (e) {
            res.status(500).json({"Error creating account": e.message});
        }
    });
})


app.post("/login", async (req, res) => {
    const {UserName, Password} = req.body;
    const userRecord = await prisma.user.findUnique({
        where : { UserName }
    });

    bcrypt.compare(Password, userRecord.hashedPassword, function(err, result) {
        if (result === true) {
            res.status(200).json({});
        } else {
            res.status(500).json({"Error logging in": err});
        }
    });
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
