### Demo

Live at https://next-magic-todo.vercel.app

## Quick Start

```
$ git clone <repo>
$ cd <repo_folder_name>
$ npm i
$ touch .env.local // will contain your environment variables
$ yarn dev // go to localhost:3000 to see your app
```

#### Environment Variables

- Get your Magic API keys from the <a href="https://dashboard.magic.link">Dashboard</a>

- This example uses MongoDB Atlas, which provides a free cloud instance of Mongo that is very easy to connect to. Visit their <a href="https://account.mongodb.com/account/register">website</a> to create an account. Once you go through the setup steps, click "Connect your Application" to grab the URI.

```
NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=your_magic_publishable_key
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
MONGO_URI=your_mongo_URI
ENCRYPTION_SECRET=32+_character_encryption_secret
MAGIC_SECRET_KEY=your_magic_secret_key
```

# Tutorial

### Introduction

This tutorial will give a short overview of how to build a To Do list app using Next.js, with authentication from Magic, using MongoDB as the database. A user will be able to sign up, create a task, mark it as completed, and delete it. At the end, you can deploy the application with Vercel. For brevity, much of this is pseudocode.

### Building the Application

```
$ npx create-next-app magic-todo-list
$ cd magic-todo-list
$ mkdir components css utils models // create the folder structure we'll need
$ touch .env.local // will hold our environment variables
$ npm install magic-sdk @magic-sdk/admin cookie mongoose @zeit/next-css @hapi/iron // install dependencies
$ yarn dev // starts the app on localhost:3000
```

- You can delete `public/vercel.svg` & `pages/api/hello.js` since we don't need them. Also clear contents from `pages/index.js`.

### Global State

`components/Store.js` will contain our application's global state. Variables defined here can be accessed by components any level down through the use of React's Context API.

```javascript
// components/Store.js
import { createContext, useState, useEffect } from "react";
import { Magic } from "magic-sdk";
import Layout from "./Layout";

/* initializing context API values */
export const MagicContext = createContext();
export const LoggedInContext = createContext();
export const LoadingContext = createContext();

const Store = ({ children }) => {
  const [magic, setMagic] = useState();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      /* We initialize Magic inside `useEffect` because it needs access to the global `window` object inside the browser */
      let m = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);
      await setMagic(m);

      /* On page refresh, send a request to /api/user to see if there's a valid user session */
      let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user`);
      let data = await res.json();

      /* If the user has a valid session with our server, it will return {authorized: true, user: user} */
      let loggedIn = data.authorized ? data.user : false;

      /* If db returns { authorized: false }, there is no valid session, so we log user out of their session with Magic if it exists */
      !loggedIn && magic && magic.user.logout();

      await setLoggedIn(loggedIn.email);

      setIsLoading(false);
    })();
  }, []);

  return (
    // `children` (passed as props in this file) represents the component nested inside < Store / > in `/pages/index.js` and `/pages/login.js`
    <LoggedInContext.Provider value={[loggedIn, setLoggedIn]}>
      <MagicContext.Provider value={[magic]}>
        <LoadingContext.Provider value={[isLoading, setIsLoading]}>
          <Layout />
          {children}
        </LoadingContext.Provider>
      </MagicContext.Provider>
    </LoggedInContext.Provider>
  );
};

export default Store;
```

### Login

The `Login` component will allow the user to authenticate with Magic. The sequence of events is:

- User enters their email and clicks "Log in"
- An email containing a magic link is sent to the user, triggered by `magic.auth.loginWithMagicLink({ email });`
- User clicks the email link
- `loginWithMagicLink()` resolves to a unique `DID token`
- A `POST` request is sent to the database with the `DID` inside the `Authorization Header`
- Server validates the `DID`, creates a user based on `getMetadata()`, and responds back to the client `{ authorized: true, user: user }`
- `setLoggedIn` is set to the user object returned by the server
- Redirect to home page

```javascript
// components/Login.js
import { useContext, useState } from "react";
import { MagicContext, LoggedInContext, LoadingContext } from "./Store";
import Router from "next/router";
import Link from "next/link";

const Login = () => {
  const [loggedIn, setLoggedIn] = useContext(LoggedInContext);
  const [isLoading, setIsLoading] = useContext(LoadingContext);
  const [email, setEmail] = useState("");
  const [magic] = useContext(MagicContext);

  const handleLogin = async () => {
    /* Get DID Token returned from when the email link is clicked */
    const DIDT = await magic.auth.loginWithMagicLink({ email });

    /* Pass the Decentralized ID token in the Authorization header to the database */
    let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/login`, {
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + DIDT,
      }),
    });

    /* If the user is authorized, return an object containing the user properties (issuer, publicAddress, email) */
    /* Else, the login was not successful and return false */
    let user = data.authorized ? data.user : false;

    if (user) {
      setLoggedIn(user.email);
      Router.push("/");
    }
  };

  return (
    <>
      {isLoading ? ( // if fetching data, show a loading symbol
        <img src="/loading.gif" />
      ) : loggedIn ? ( // If the user is logged in
        <>You're already logged in!</>
      ) : (
        <form>{/* form for user to enter email */}</form>
      )}
    </>
  );
};

export default Login;
```

### Customizing the UI

Magic allows you to own your UI. You can hide the modal after a user clicks Log In with `await loginWithMagicLink({ email, showUI: false })`. If you are on the <a href="https://magic.link/pricing">Starter Plan</a>, you can also customize the modal and email by adding your logo and choosing the style colors. Navigate to the <a href="https://dashboard.magic.link">Magic Dashboard</a> --> "Custom Branding".

### Handling Login Server-side

In `/pages/api/user/login.js` we handle POST requests to authenticate the user with our database. Once we validate the `DID token` and create a new user in the database, we have to issue a cookie to track our user sessions.

```javascript
// pages/api/user/login.js
import { magic } from "../../../utils/magic";
import { encryptCookie, cookie } from "../../../utils/cookie";
import { serialize } from "cookie";
import User from "../../../models/User";
import dbConnect from "../../../models/connection";

/* open connection to database */
dbConnect();

/* save new user to database */
const signup = async (user) => {
  let newUser = {
    email: user.email,
    issuer: user.issuer,
  };
  return await new User(newUser).save();
};

export default async (req, res) => {
  const { method } = req;

  if (method !== "POST") {
    return res.status(400).json({ message: "Only POST requests are accepted" });
  }

  /* strip token from Authorization header */
  let DIDT = magic.utils.parseAuthorizationHeader(req.headers.authorization);

  /* validate token to ensure request came from the issuer */
  await magic.token.validate(DIDT);

  /* decode token to get claim obj with data */
  let claim = magic.token.decode(DIDT)[1];

  /* get user data from Magic */
  const userMetadata = await magic.users.getMetadataByIssuer(claim.iss);

  /* check if user is already in */
  const existingUser = await User.findOne({ issuer: claim.iss });

  /* Create new user if doesn't exist */
  !existingUser && signup(userMetadata);

  /* encrypted cookie details */
  const token = await encryptCookie(userMetadata);

  /* set cookie */
  await res.setHeader("Set-Cookie", serialize("auth", token, cookie));

  /* send back response with user obj */
  return res.json({ authorized: true, user: userMetadata });
};
```

### Is User Authorized

We are also going to create an enpoint `pages/api/user` where our frontend can check if the current user is authorized. We simply check the validity of the auth cookie, if it exists.

```javascript
// pages/api/user/index.js
import { decryptCookie } from "../../../utils/cookie";

export default async (req, res) => {
  const { method } = req;

  if (method !== "GET") {
    return res.status(400).json({ message: "This route only accepts GET requests" });
  }

  let userFromCookie;

  try {
    userFromCookie = await decryptCookie(req.cookies.auth);
  } catch (error) {
    /* if there's no valid auth cookie, user is not logged in */
    return res.json({ authorized: false, error });
  }

  /* send back response with user obj */
  return res.json({ authorized: true, user: userFromCookie });
};
```

### Logout

`pages/api/user/logout.js` overrides the current auth cookie with one that's expired essentially clearing it out. It also ensures the user is logged out of their session with Magic.

```javascript
// pages/api/user/logout.js
import { magic } from "../../../utils/magic";
import { cookie } from "../../../utils/cookie";
import { serialize } from "cookie";

export default async (req, res) => {
  /* replace current auth cookie with an expired one */
  res.setHeader(
    "Set-Cookie",
    serialize("auth", "", {
      ...cookie,
      expires: new Date(Date.now() - 1),
    })
  );

  let userFromCookie;

  try {
    userFromCookie = await decryptCookie(req.cookies.auth);
  } catch (error) {
    /* if there's no valid auth cookie, user is not logged in */
    return res.json({ authorized: false, error });
  }

  /* log use out of Magic */
  await magic.users.logoutByToken(userFromCookie.publicAddress);

  return res.json({ authorized: false });
};
```

### Deploying the app with Vercel

To deploy with Vercel, follow <a href="https://docs.magic.link/integrations/next#how-to-deploy-a-nextjs-magic-example">this tutorial</a>.
