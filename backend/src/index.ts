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
    const user = await prisma.user.findFirst({
         where : {
             id : req.body.id
         }
     })
 
     if (!user) {
         return res.status(404).json("User not found")
     }
    const check = await prisma.org.findFirst({
        where : {
            name : req.body.name
        }
    })
    if(check) { 
        return res.json("org already there")
    }

    const response = await prisma.org.create({
        data:{
            name : req.body.name,
            userId : req.body.id
        }
    })


    const update = await prisma.user.update({
        where : {
            id : req.body.id
        },
        data : {
            orgCount : user.orgCount + 1,
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