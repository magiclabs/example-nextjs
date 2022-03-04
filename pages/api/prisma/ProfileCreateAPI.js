import { PrismaClient, UserCreateInput } from "@prisma/client"
import { useSession, getSession } from 'next-auth/react'

const prisma = new PrismaClient()

export default async function ProfileCreateAPI(req, res) {
    const session = await getSession({ req })
    const { body } = req

    if (!session) {
        return res.status(401).json({ unauthorized: true })
    }
    if (req.method === 'POST') {
        const register = await prisma.user.update({
            where: {
                email: session.user.email
            },
            data: {
                profile: {
                    create: JSON.parse(body)
                },
            },
        })
        res.json(register)

    } else {
        // handle other http method
    }
}