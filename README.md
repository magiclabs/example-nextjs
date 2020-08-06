### Demo

Live at https://next-magic-todo.vercel.app

# Clone the repo to set up on your own computer

1. `$ git clone <repo>`
2. `$ cd <repo_folder_name>`
3. `$ npm i`
4. `$ touch .env.local` // contains the environment variables - below are the one's you'll need for this project (get your Magic API keys from the <a href="https://dashboard.magic.link">Dashboard</a>, scroll down for instructions to get your MongoDB URI)

```
NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=your_magic_publishable_key
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
MONGO_URI=your_mongo_URI
ENCRYPTION_SECRET=32+_character_encryption_secret
MAGIC_SECRET_KEY=your_magic_secret_key
```

5. `$ yarn dev` // go to localhost:3000 to see your app

# Tutorial

### Introduction

This tutorial will cover how to build a To Do list app using Next.js, with authentication from Magic, and MongoDB as the database. A user will be able to sign up, create a task, mark it as completed, and delete it. At the end, you can deploy the application with Vercel.

This tutorial will have the following sections:

#### Overview

- Dependencies
- Flow
- Session Management
- Setting up Mongo DB Atlas

#### Building the application

- Public files
- Environment Variables
- Styles
- Global State
- Navigation Bar
- Login Route
- Customizing the UI
- Home Page (Todo List)
- Creating our Schema
- Handling Login (backend)
- Creating/Encrypting/Decrypting Cookies
- Checking if a user is Authorized (backend)
- Logout (backend) (authentication is complete after this step!)
- TodoList Component
- Creating and Retrieving To Do's (backend)
- Todo Component
- Update Todo (backend)
- Delete Todo (backend)

### Dependencies

- magic-sdk - Magic client-side SDK for authentication
- @magic-sdk/admin - Magic server-side SDK for validating DID tokens, getting user metadata, and more
- mongoose - framework for MongoDB
- cookie - create cookies
- @hapi/iron - encryption and decryption of our cookie
- @zeit/next-css - to add global CSS to our project

### Flow

1. User signs up
2. Magic sends them an email with a magic link
3. User clicks the email link, authenticating them in the app
4. `loginWithMagic({email})` resolves to a `DID Token` (`DIDT`)
5. Client sends the `DIDT` to the server in the form of `Authorization: Bearer {DIDT}`
6. Server validates the `DIDT` with the Magic admin SDK
7. If the `DIDT` is valid, use Magic to get that user's metadata (`issuer`, `publicAddress`, `email`)
8. If the user already exists in the database, log them in, if they don't, add them to the db and sign them up
9. Create, encrypt (using `@hapi/iron`) and set a cookie contianing the user specific data (`issuer`, `publicAddress`, `email`)
10. Return the user to the client, who now has a cookie-managed session with our app
11. On all subsequent requests to the server, validate the cookie in order to create, read, update or delete a To Do.

### Session Management

After a user authenticates, they will create two sessions, one with our app (first party), one with Magic (third party). We will rely on our first party session, managed by issuing a cookie to each user once they successfully login. The cookie will contain user-specific data allowing us to tell who makes each request. The cookie is encrypted before it's set inside the client, and decrypted by our backend each time we need to read from it.

The user session with Magic is created when they click the email link, and until that expires or the user is explicitly logged out with `m.user.logut()`, the user won't have to click an email link if you call `m.auth.loginWithMagicLink()` again. Sessions are valid for 7 days and is not customizable by the first party application. We don't need to worry much about the Magic session since we're handling them on our own.

### Setting up MongoDB Atlast

MongoDB Atlas provides a free cloud instance of Mongo which is very easy to connect to.

1. Visit the <a href="https://account.mongodb.com/account/register">https://account.mongodb.com/account/register</a>
2. Create a free Shared Cluster.
3. No need to change the default settings unless you prefer, then click "Create Cluster".
4. Your cluster will take a few minutes to be created.
5. Click "Connect"
6. Whitelist IP addresses that are able to connect to this database as well as a username and password (this will be passed in the connection string). To make the app accessible to all IP's, set the value to `0.0.0.0/0`.
7. Once that's done, click "Choose a Connection Method".
8. Click "Connect Your Application"
9. Copy the string (make sure to replace the < password > placeholder with the password of the dbUser you created in step 6), this will be your Mongo URI environment variable.

### Building the App

The following command will using `yarn`.

1. `$ npx create-next-app magic-todo-list` // creates a boilerplate Next.js application called `magic-todo-list`. Automatically installs `react`, `react-dom` and `next` (if prompted to pick a template, choose `Default starter app`)

2. `$ cd magic-todo-list`

3. `$ mkdir components css utils models` // create the folder structure we'll need

4. `$ touch .env.local` // will hold our environment variables

5. `$ npm install magic-sdk @magic-sdk/admin cookie mongoose @zeit/next-css @hapi/iron` // install dependencies

- When you want to start the application, run `$ yarn dev` // opens up in localhost:3000

- You can delete `public/vercel.svg` & `pages/api/hello.js` since we don't need them. Also clear contents from `pages/index.js`

### Public Files

Putting our images in `/public` allows us to easily reference them inside components.

- Logo: https://magic.link/brand-assets
- Styled checkmark: https://www.iconfinder.com/icons/1879617/check_checkmark_right_success_tick_icon
- Unstyled checkmark: https://www.iconfinder.com/icons/749198/accept_check_checkmark_good_ok_success_tick_icon
- Loading gif: https://gifer.com/en/22DX

### Environment Variables

Our environment variables go inside `.env.local`. All are accessible to the Node.js environment but only the variables prefixed `NEXT_PUBLIC` are exposed to the browser.

The Mongo URI will be the string you copied in step 9 when we set up our database. Get your Magic API keys in the <a href="https://dashboard.magic.link" >Dashbaord</a>. Create an encryption secret to encrypt and decrypt each user's auth cookie.

```
NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=your_magic_publishable_key
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
MONGO_URI=your_mongo_URI
ENCRYPTION_SECRET=32+_character_encryption_secret
MAGIC_SECRET_KEY=your_magic_secret_key
```

### Styling

All styles in this example can be found at this <a href="https://gist.github.com/hcote/2ae36f2131c81e5c7c175222804e9383">gist</a>.

To apply the styles, we enter the following code in `pages/_app.js`.

```javascript
// pages/_app.js
import "../css/login.css";
import "../css/todolist.css";
import "../css/layout.css";

// This default export is required in a new `pages/_app.js` file.
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

### Store.js and Global State

`components/Store.js` will contain our application's global state. Variables defined here can be accessed by any component any level down without having to pass the state as props through each component. This is done through the use of React's Context API.

`LoggedInContext` tracks if a user is logged in. `MagicContext` stores our Magic instance, and `LoadingContext` will tell us if API requests are being made in order to set our state, so we can show a loading symbol.

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

### Navigation Bar

We want to have consistent navigation bar on each page, which is why in `Store.js`, above the `children` prop, we also render the `Layout` component. This contains our logo, a Welcome message to the logged in user if there is one, and a Logout / Login button.

```javascript
// components/Layout.js
import Head from "next/head";
import { useContext } from "react";
import { LoggedInContext, MagicContext } from "./Store";
import Link from "next/link";

const Layout = () => {
  const [loggedIn, setLoggedIn] = useContext(LoggedInContext);
  const [magic] = useContext(MagicContext);

  /**
   * Log user out of of the session with our app (clears the `auth` cookie)
   * Log the user out of their session with Magic
   */
  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/logout`, {
      method: "GET"
    });
    setLoggedIn(false);
    await magic.user.logout();
  };

  return (
    <>
      <Head>
        <title>Next Magic Todo</title>
      </Head>
      <nav className="nav">
        <div>
          <img src="/magic-horizontal-color-white.png" className="nav-logo" alt="Logo" />
        </div>
        {/* If a user is logged in, show our Welcome message and Logout button */}
        {loggedIn ? (
          <>
            <div className="nav-user">Welcome, {loggedIn}</div>
            <div className="logout-btn">
              <a
                onClick={e => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Logout
              </a>
            </div>
          </>
        ) : (
          // Else, show the Login button
          <>
            <Link href="/login">
              <div className="login-btn">
                <a>Log in</a>
              </div>
            </Link>
          </>
        )}
      </nav>
    </>
  );
};

export default Layout;
```

### Login Route

To create our `/login` route (`pages/login.js`) we wrap the `Login` component (which we're about to create) inside `Store` so it has access to the global state.

```javascript
// pages/login.js
import Login from "../components/Login";
import Store from "../components/Store";

const LoginView = () => {
  return (
    <Store>
      <Login />
    </Store>
  );
};

export default LoginView;
```

Now we need to create the `Login` component. It will allow the user to authenticate with Magic. The flow is:

- User enters their email and clicks "Log in"
- An email containing a magic link is sent to the user, triggered by `magic.auth.loginWithMagicLink({ email })`
- User clicks the email link
- `loginWithMagicLink()` resolves to a unique `DID token`
- A `POST` request is sent to the database with the `DID` inside the `Authorization Header`
- Server validates the `DID`, creates a user based on `getMetadata()`, and responds back to the client `{ authorized: true, user: user }`
- `setLoggedIn` is set to the user object returned by the server
- Redirect to /

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
  const [errorMsg, setErrorMsg] = useState("");
  const [disableLogin, setDisableLogin] = useState(false);

  const authenticateWithDb = async DIDT => {
    /* Pass the Decentralized ID token in the Authorization header to the database */
    let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user/login`, {
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + DIDT
      })
    });

    let data = await res.json();

    /* If the user is authorized, return an object containing the user properties (issuer, publicAddress, email) */
    /* Else, the login was not successful and return false */
    return data.authorized ? data.user : false;
  };

  const handleLogin = async () => {
    try {
      /* disable the login button to prevent users from clicking it multiple times, triggering mutliple emails */
      setDisableLogin(true);

      /* Get DID Token returned from when the email link is clicked */
      const DIDT = await magic.auth.loginWithMagicLink({ email });

      /* `user` will be the user object returned from the db, or `false` if the login failed */
      let user = await authenticateWithDb(DIDT);

      if (user) {
        setLoggedIn(user.email);
        Router.push("/");
      }
    } catch (err) {
      /* If the user clicked "cancel", allow them to click the login again */
      setDisableLogin(false);

      /* Handle error (which can occur if the user clicks `Cancel` on the modal after submitting their email) */
      console.log(`Error logging in with Magic, ${err}`);
    }
  };

  return (
    <>
      {isLoading ? ( // if fetching data, show a loading symbol
        <img
          className="loading-gif"
          src="/loading.gif"
          alt="loading..."
          height="35px"
          alt="Loading..."
        />
      ) : loggedIn ? ( // If the user is logged in, show a link to the home page
        <>
          You're already logged in! Click <Link href="/">here</Link> to view your Todos.
        </>
      ) : (
        <div className="login-form">
          <h4 className="login-form-header">Enter Your Email</h4>
          <form>
            <input
              className="login-form-input"
              type="email"
              value={email}
              onChange={e => {
                setErrorMsg(""); // remove error msg
                setEmail(e.target.value);
              }}
            />
            <div className="error-msg">{errorMsg}</div>
            <input
              className="login-form-submit-btn"
              type="submit"
              value="Log in"
              disabled={disableLogin}
              onClick={e => {
                e.preventDefault();
                if (!email) return setErrorMsg("Email cannot be empty.");
                handleLogin();
              }}
            />
          </form>
        </div>
      )}
    </>
  );
};

export default Login;
```

### Customizing the UI

Magic allows you to own your UI. If you want to hide the modal that displays after a user clicks "Log in", you can by passing an optional second argument `await loginWithMagicLink({ email, showUI: false })`. If you are on the <a href="https://magic.link/pricing">Starter Plan</a>, you can also customize the modal and email by adding your logo and choosing the style colors. Navigate to the <a href="https://dashboard.magic.link">Magic Dashboard</a> --> "Custom Branding".

### Home Page (Todo List)

Now we'll create our home page route, `/` (`pages/index.js`). Wrap `TodoList` inside `Store` so it has access to the global variables defined there.

```javascript
// pages/index.js
import TodoList from "../components/todos/TodoList";
import Store from "../components/Store";

const TodoView = () => {
  return (
    <Store>
      <TodoList />
    </Store>
  );
};

export default TodoView;
```

### Creating our Schema

Now moving onto the backend, we need to define our database schemas. First, connect to the database in `models/connection.js`.

```javascript
// models/connection.js
import Mongoose from "mongoose";

function dbConnect() {
  if (Mongoose.connection.readyState === 0) {
    Mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
}

dbConnect();

export default dbConnect;
```

`/models/User.js`

```javascript
// models/User.js
const mongoose = require("mongoose");
const Todo = require("./Todo");

const Schema = mongoose.Schema;

// include this to avoid error: OverwriteModelError: Cannot overwrite `User` model once compiled.
delete mongoose.connection.models["User"];

const UserSchema = new Schema({
  email: { type: String, required: true },
  issuer: { type: String, required: true, unique: true }, // did:ethr:public_address
  todos: [
    {
      type: Schema.Types.ObjectId,
      ref: Todo
    }
  ]
});

module.exports = mongoose.model("User", UserSchema);
```

`models/Todo.js`

```javascript
// models/Todo.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// include this to avoid error: OverwriteModelError: Cannot overwrite `Todo` model once compiled.
delete mongoose.connection.models["Todo"];

const TodoSchema = new Schema({
  todo: { type: String, required: true },
  completed: Boolean
});

module.exports = mongoose.model("Todo", TodoSchema);
```

### Handling Login (backend)

In `/pages/api/user/login.js` we handle POST requests to authenticate the user with our database. Once we validate the `DID token` and create a new user in the database, we have to issue a cookie to track our user sessions. The cookie helper functions will be defined next.

```javascript
// pages/api/user/login.js
import { Magic } from "@magic-sdk/admin";
import { encryptCookie, cookie } from "../../../utils/cookie";
import { serialize } from "cookie";
import User from "../../../models/User";
import dbConnect from "../../../models/connection";

/* open connection to database */
dbConnect();

/* initiate Magic instance */
const magic = new Magic(process.env.MAGIC_SECRET_KEY);

/* save new user to database */
const signup = async (user, iat) => {
  let newUser = {
    email: user.email,
    issuer: user.issuer,
    lastLoginAt: iat
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

  /**
   * decode token to get claim obj with data, see https://docs.magic.link/admin-sdk/node-js/sdk/token-module/decode#returns
   *
   * `claim` will be in the form of
   * {
   * iat: 1595635806,
   * ext: 1595636706,
   * iss: 'did:ethr:0x84Ebf8BD2b35dA715A5351948f52ebcB57B7916A',
   * sub: 'LSZlrB5urQNFIXEXpTdVnI6BzwdJNJMlfqsEJvrCvRI=',
   * aud: 'did:magic:026e022c-9b57-42bf-95d4-997543be1c21',
   * nbf: 1595635806,
   * tid: 'aea69063-0665-41ca-a2e2-4ff36c734703',
   * add: '0xf6ee75197340d270156c25054a99edda0edfc0b491fe1b433c9360481c043992428c82ca8b341272ba81d8004ddfbf739dda2368743349db0b9f97f3293707aa1c'
   * }
   */
  let claim = magic.token.decode(DIDT)[1];

  /**
   * get user data from Magic
   *
   * `userMetadata` will be on the form of:
   * {
   * issuer: 'did:ethr:0x84Ebf7BD2b35aD715A5351948f52ebcB57B7916A',
   * publicAddress: '0x84Ebf7BD2b35aD715A5351948f52ebcB57B7916A',
   * email: 'example@gmail.com'
   * }
   */
  const userMetadata = await magic.users.getMetadataByIssuer(claim.iss);

  /* check if user is already in */
  const existingUser = await User.findOne({ issuer: claim.iss });

  /* Create new user if doesn't exist */
  !existingUser && signup(userMetadata, claim.iat);

  /* encrypted cookie details */
  const token = await encryptCookie(userMetadata);

  /* set cookie */
  await res.setHeader("Set-Cookie", serialize("auth", token, cookie));

  /* send back response with user obj */
  return res.json({ authorized: true, user: userMetadata });
};
```

### Cookie (encryption/decryption)

`utils/cookie.js` leverages the `@hapi/iron` library to encrypt and decrypt the cookies.

```javascript
// utils/cookie.js
import Iron from "@hapi/iron";

/* defining the cookie attributes */
export const cookie = {
  maxAge: 60 * 60, // 1 hour
  secure: false, // set `true` for https only
  path: "/", // send the cookie on all requests
  httpOnly: true, // makes cookie inaccessible from browser (only transfered through http requests, and protects against XSS attacks)
  sameSite: "lax"
};

export const decryptCookie = async cookie => {
  return await Iron.unseal(cookie, process.env.ENCRYPTION_SECRET, Iron.defaults);
};

export const encryptCookie = async userMetadata => {
  return await Iron.seal(userMetadata, process.env.ENCRYPTION_SECRET, Iron.defaults);
};
```

### Checking if a user is Authorized

We are also going to create an enpoint (`pages/api/user`) where our frontend can check if the current user is authorized. We simply check the validity of the auth cookie, if it exists.

```javascript
// pages/api/user/index.js
import { decryptCookie } from "../../../utils/cookie";

/**
 * This route checks if a user is autheticated
 */
export default async (req, res) => {
  const { method } = req;

  if (method !== "GET") {
    return res.status(400).json({ message: "This route only accepts GET requests" });
  }

  let userFromCookie;

  try {
    /**
     * `userFromCookie` will be on the form of:
     * {
     * issuer: 'did:ethr:0x84Ebf7BD2b35aD715A5351948f52ebcB57B7916A',
     * publicAddress: '0x84Ebf7BD2b35aD715A5351948f52ebcB57B7916A',
     * email: 'example@gmail.com'
     * }
     */
    userFromCookie = await decryptCookie(req.cookies.auth);
  } catch (error) {
    /* if there's no valid auth cookie, user is not logged in */
    return res.json({ authorized: false, error });
  }

  /* send back response with user obj */
  return res.json({ authorized: true, user: userFromCookie });
};
```

### Logout (backend)

Next create `pages/api/user/logout.js`. It overrides the current auth cookie with one that's expired essentially clearing it out.

```javascript
// pages/api/user/logout.js
import { cookie } from "../../../utils/cookie";
import { serialize } from "cookie";

export default async (req, res) => {
  /* replace current auth cookie with an expired one */
  res.setHeader(
    "Set-Cookie",
    serialize("auth", "", {
      ...cookie,
      expires: new Date(Date.now() - 1)
    })
  );

  return res.json({ authorized: false });
};
```

The authentication is complete!

### "Add Todo" Form

The `TodoList` component (`components/todos/TodoList.js`) gives users a form to create a new task. After sending the task to the database, if the response is `{ authorized: true }`, then it was successfully added to the db and we set `allTodos` with the array returned from the sever. If the response is `{ authorized: false }` that means the auth cookie is invalid/expired, and we log the user out of their Magic session, as well as set `loggedIn` to `false`.

```javascript
// components/todos/TodoList.js
import { useState, useContext, useEffect } from "react";
import { MagicContext, LoggedInContext, LoadingContext } from "../Store";
import Todo from "./Todo";

const TodoList = () => {
  const [formTodo, setFormTodo] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [allTodos, setAllTodos] = useState([]);
  const [magic] = useContext(MagicContext);
  const [loggedIn, setLoggedIn] = useContext(LoggedInContext);
  const [isLoading, setIsLoading] = useContext(LoadingContext);

  /**
   * Creates a new Todo in the database
   */
  const addTodoToDb = async () => {
    let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/todos`, {
      method: "POST",
      body: JSON.stringify({ formTodo })
    });

    let data = await res.json();

    /* If the db returns {authorized: false}, the cookie has expired, so logout the user */
    /* Else, update our Todo List using the db response */
    !data.authorized ? logout() : setAllTodos(data.todos);
  };

  /**
   * Logs user out of their session with Magic and sets `isLoggedIn` to false
   */
  const logout = async () => {
    setLoggedIn(false);
    await magic.user.logout();
  };

  useEffect(() => {
    /* when loggedIn changes value (i.e. when a user logs in) fetch todos from db */
    if (loggedIn) {
      (async () => {
        setIsLoading(true);

        let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/todos`);
        let data = await res.json();

        /* set Todos with the db response */
        await setAllTodos(data.user.todos);

        setIsLoading(false);
      })();
    }
  }, [loggedIn]);

  return (
    <>
      {isLoading ? ( // if fetching data, show a loading symbol
        <img
          className="loading-gif"
          src="/load.gif"
          alt="loading..."
          height="30px"
          alt="Loading..."
        />
      ) : // If the user is logged in, show their Todo List
      loggedIn ? (
        <div className="body-container">
          <div className="add-todo-form-container">
            <form className="add-todo-form">
              <input
                className="add-todo-input"
                type="text"
                value={formTodo}
                onChange={e => {
                  setErrorMsg(""); // clear error msg
                  setFormTodo(e.target.value);
                }}
                placeholder=" Enter Todo..."
              />
              <input
                className="add-todo-submit-btn"
                type="submit"
                value="Add"
                onClick={e => {
                  e.preventDefault();
                  if (!formTodo) return setErrorMsg("Field must not be empty."); // if form is empty, show the error msg
                  setFormTodo(""); // clear form input
                  setErrorMsg(""); // clear error msg if there is one
                  addTodoToDb(); // create new Todo in db
                }}
              />
            </form>
            <div className="error-msg">{errorMsg}</div>
          </div>
          <div className="todo-list-container">
            <div className="items-left-display">
              {allTodos && allTodos.filter(todo => todo.completed === false).length} item(s) left
            </div>
            {/* Display all of our Todos by looping through the `allTodos` array */}
            {allTodos &&
              allTodos.map(todo => {
                return (
                  <Todo todo={todo} key={todo._id} allTodos={allTodos} setAllTodos={setAllTodos} />
                );
              })}
          </div>
        </div>
      ) : (
        <div className="body-container instructions-container">
          <ol className="instructions">
            <li className="instructions-item">Log in to get started!</li>
            <li className="instructions-item">Then you can add todos to your list</li>
            <li className="instructions-item">
              To cross off an item, click the{" "}
              <img src="/styled_check.png" className="toggle-complete-btn" />{" "}
            </li>
            <li className="instructions-item">
              Or delete an item by clicking the{" "}
              <span className="delete-todo-btn-example">&#10005;</span>
            </li>
          </ol>
        </div>
      )}
    </>
  );
};

export default TodoList;
```

### Creating and retrieving To Do's (backend)

We need to handle requests for getting and creating To Do's in the backend (`pages/api/todos/index.js`). If the server receives a `GET` request, we need to return that user's To Do's. If it's a `POST` request, we create a new `todo`, associate it to the user, then return the list to the client.

```javascript
// pages/api/todos/index.js
import { decryptCookie } from "../../../utils/cookie";
import User from "../../../models/User";
import Todo from "../../../models/Todo";

export default async (req, res) => {
  const { method } = req;

  let userFromCookie;

  try {
    /* extract user from cookie */
    userFromCookie = await decryptCookie(req.cookies.auth);
  } catch (error) {
    /* if there's no valid auth cookie, user is not logged in */
    return res.status(401).json({ authorized: false, error });
  }

  if (method === "GET") {
    try {
      /* get user from DB */
      const user = await User.findOne({ issuer: userFromCookie.issuer }).populate("todos");

      /* send back response with user obj */
      return res.json({ authorized: true, user });
    } catch (error) {
      /* if error, send back error */
      return res.json({ authorized: false, error });
    }
  }

  /**
   * CREATE todo in DB
   */
  if (method === "POST") {
    try {
      /* create new Todo */
      const newTodo = new Todo({ todo: JSON.parse(req.body).formTodo, completed: false });

      /* save Todo */
      const savedTodo = await newTodo.save();

      /* find user in DB */
      let userFromDb = await User.findOne({ issuer: userFromCookie.issuer }).populate("todos");

      /* add new todo to user's array of todos */
      userFromDb.todos.push(savedTodo);

      /* save user */
      await userFromDb.save();

      /* send back res with saved todo */
      return res.json({ authorized: true, todos: userFromDb.todos });
    } catch (error) {
      /* if error, send back error */
      return res.json({ authorized: false, error });
    }
  }

  return res.json({ authorized: false, message: "This route only accepts GET and POST requests" });
};
```

### The Todo Component

Each To Do will contain the task, a button toggle "completed" or "not completed", and a button to delete it. When we render each task, we will add a class if it's completed, so we know to style it as such. We also use the `completed` attribute to determine which check mark image to display. Clicking the check mark will send a `PUT` request to the database to update that specific item (using the `id` assigned to it by Mongo). Deleting the To Do triggers one function to remove it from the database, and another to remove it from the view.

```javascript
// components/todos/Todo.js
import { useContext } from "react";
import { MagicContext, LoggedInContext } from "../Store";

const Todo = ({ todo, allTodos, setAllTodos }) => {
  const [magic] = useContext(MagicContext);
  const [isLoggedIn, setIsLoggedIn] = useContext(LoggedInContext);

  const toggleCompletedDb = async (id, completed) => {
    let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/todos/update/${id}`, {
      method: "PUT",
      body: JSON.stringify({ id, completed })
    });

    let data = await res.json();

    /**
     * If user is not authorized (the cookie has expired), logout user
     * Else, update the Todo List using the response from the db
     */
    !data.authorized ? logout() : setAllTodos(data.user.todos);
  };

  const deleteFromDb = async id => {
    let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/todos/delete/${id}`, {
      method: "DELETE"
    });

    let data = await res.json();

    /* If the database responds with {authorized: false}, logout user */
    !data.authorized && logout();
  };

  /* Remove the deleted Todo from our displayed Todo List */
  const removeTodoFromView = id => {
    let newTodos = allTodos.filter(todo => id !== todo._id);
    setAllTodos(newTodos);
  };

  /* Set `loggedIn` to false and log the user out of their session with Magic */
  const logout = async () => {
    setIsLoggedIn(false);
    await magic.user.logout();
  };

  return (
    /* If the Todo has the `completed` attribute, add `completed` to the className */
    <div className={`todo-item-container ${todo.completed ? `completed` : ""}`}>
      {todo && (
        <div className={`todo-item-name`}>
          <img
            /* Change the img source depending on if the Todo is completed or not */
            src={todo.completed ? "/unstyled_check.png" : "/styled_check.png"}
            className="toggle-complete-btn"
            onClick={async e => {
              /* Update the `completed` attribute in our database */
              let todoDiv = e.target.parentElement.parentElement;
              let completed = todoDiv.classList.contains("completed") ? false : true;
              await toggleCompletedDb(todo._id, completed);
            }}
          />
          {todo.todo}
        </div>
      )}
      <form>
        <input
          type="button"
          value="&#10005;"
          className="delete-todo-btn"
          onClick={() => {
            deleteFromDb(todo._id);
            removeTodoFromView(todo._id);
          }}
        />
      </form>
    </div>
  );
};

export default Todo;
```

### Update Todo (backend)

Our requests to toggle an item's `completed` attribute goes to `pages/api/todos/update/[id].js`. By naming our file `[id].js`, Next.js allows us to grab the dynamic `id` value passed in the parameter. It simply updates the To Do's `completed` attribute.

```javascript
// pages/api/todos/update/[id].js
import { decryptCookie } from "../../../../utils/cookie";
import User from "../../../../models/User";
import Todo from "../../../../models/Todo";

export default async (req, res) => {
  const {
    query: { id }, // id from query params
    method // request method (i.e. GET, POST, PUT, DELETE)
  } = req;

  if (method !== "PUT") {
    return res.json({ authorized: false, message: "This route only accepts PUT requests" });
  }

  let userFromCookie;

  try {
    /* extract user from cookie */
    userFromCookie = await decryptCookie(req.cookies.auth);
  } catch (error) {
    /* if there's no valid auth cookie, user is not logged in */
    return res.json({ authorized: false, error });
  }

  /**
   * UPDATE todo (toggle completed/not completed)
   */
  try {
    /* update Todo (completed/not completed) */
    await Todo.updateOne({ _id: id }, { $set: { completed: JSON.parse(req.body).completed } });

    /* grab user */
    let user = await User.findOne({ issuer: userFromCookie.issuer }).populate("todos");

    /* return user */
    return res.json({ authorized: true, user });
  } catch (error) {
    /* if error, send back error */
    return res.json({ authorizeed: false, error });
  }
};
```

### Delete Todo (backend)

We also need to allow for a dynamic `id` parameter so we know which item to delete. Create the file `pages/api/todos/delete/[id].js`.

```javascript
// pages/api/todos/delete/[id].js
import { decryptCookie } from "../../../../utils/cookie";
import User from "../../../../models/User";
import Todo from "../../../../models/Todo";

export default async (req, res) => {
  const {
    query: { id }, // id from query params
    method // request method (i.e. GET, POST, PUT, DELETE)
  } = req;

  if (method !== "DELETE") {
    return res.json({ authorized: false, message: "This route only accepts DELETE requests" });
  }

  let userFromCookie;

  try {
    /* extract user from cookie */
    userFromCookie = await decryptCookie(req.cookies.auth);
  } catch (error) {
    /* if there's no valid auth cookie, user is not logged in */
    return res.json({ authorized: false, error });
  }

  /**
   * DELETE todo from database
   */
  try {
    /* get user from DB */
    const user = await User.findOne({ issuer: userFromCookie.issuer }).populate("todos");

    /* delete Todo */
    await Todo.deleteOne({ _id: id });

    /* remove Todo from user's `todos` array */
    user.todos = user.todos.filter(t => t._id !== id);

    /* save user */
    await user.save();

    /* send back response noting the user was authorized to delete this todo */
    return res.json({ authorized: true });
  } catch (error) {
    /* if error, send back error */
    return res.json({ authorizeed: false, error });
  }
};
```

The application is now complete!

### Deploying the app with Vercel

To deploy with Vercel, follow <a href="https://docs.magic.link/integrations/next#how-to-deploy-a-nextjs-magic-example">this tutorial</a>.
