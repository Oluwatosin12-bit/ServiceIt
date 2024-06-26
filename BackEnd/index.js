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


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
