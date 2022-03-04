import { PrismaClient } from "@prisma/client";
import { runMiddleware } from "../corsMiddleWare";
import Cors from 'cors'
import { ActiveUser } from "../../../components/trial";

// initialize the cors middleware
const cors = Cors({
    methods: ['GET', 'HEAD'],
})

const prisma = new PrismaClient()

export default async function UserExist(req, res) {
    
    const { body } = req
    await runMiddleware(req, res, cors)

    const result = await prisma.user.findUnique({
        where: {
            // email: `${user.email}`
            // email: 'phiprof@gmail.com'
            email: ActiveUser
        }
    })
    res.json(result)
  
    
}


