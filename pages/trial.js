import Trial from "../components/trial";
import { useContext } from "react";
import { UserContext } from "../lib/UserContext";

export default function TrialPage({ result}) {
    const [ user ] = useContext(UserContext)
    return(
        <div>
            <h1>this page works</h1>
            <Trial result = {result} />
        </div>
    )
}

export const Family = () => {
    const [ user ] = useContext(UserContext)
}

export const getServerSideProps = async ({ req }) => {
    const result = await prisma.user.findUnique({
where: {
email: llll
},
    })
    return {
        props: {
            result
        }
    }
}