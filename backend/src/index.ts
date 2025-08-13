import { PrismaClient } from "../prisma/generated/prisma"
import express from "express"
const prisma = new PrismaClient();;

const app = express();
app.use(express.json())

app.post("/org", async (req,res) => {
    const response = await prisma.user.create({
        data : {
            name  : req.body.name,
            email : req.body.email,
            password : req.body.password
         }
    })
    console.log("added data");
    console.log(response.id);
    return res.json(response)
})

app.post("/create" , async (req,res) => {
    const response = await prisma.org.create({
        data:{
            name : req.body.name,
            userId : req.body.id
        }
    })
    console.log("added org");
    console.log(response.id);
    return res.json(response)
})

const PORT = 3000;
app.listen(PORT,()=>{
    console.log("Server running on port 3000");
})