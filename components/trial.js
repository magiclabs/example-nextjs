import useSWR from "swr";
import { useContext } from "react";
// import { UserContext } from "../../../lib/UserContext";
import { UserContext } from "../lib/UserContext";

const fetcher = url => fetch(url).then(r => r.json())



  export default function Trial({result}) {
      const [user] = useContext(UserContext)
    const { data, error } = useSWR('http://localhost:3000/api/prisma/userExistAPI', fetcher)
    if (error) return <div>Error occurred</div>
    if (!data) return <div>loading...</div>

    console.log('this is data', data)

    return(
        <div>
            {data}
        </div>
    )
}



// export function ActiveUser() {
//     const [user] = useContext(UserContext)
// // user?.issuer && user.email
//     return (
//         user.email
//     )
// }




// export default function Trial() {
//     const [user] = useContext(UserContext)
//     fetch('', {
//         method: 'GET',
//         body: JSON.stringify({
//             // user.email
//         })
//     })
    
// }



// const onSubmit = async ({
//     role
//   }) => {
//     fetch('http://localhost:3000/api/users/ProfileCreateAPI', {
//       method: 'POST', 
//       body: JSON.stringify({
//         role
//       })
//     }),
//     fetch('http://localhost:8080/baseR4/', {
//         method: 'POST',
//         body: ProfesionalResourceCreateJSON ,
//         headers: {
//           'content-Type': 'application/fhir+json'
//         },
//       })
//   }

