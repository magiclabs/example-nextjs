# Demo

Live at https://magic-nextjs.vercel.app/login

# Quick Start Instructions

```
$ git clone https://github.com/magiclabs/example-nextjs
$ cd example-nextjs
$ mv .env.local.example .env.local // enter your Magic API keys in your env variables
$ yarn install
$ yarn dev // starts app in http://localhost:3000
```

## Environment Variables

```
NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=pk_live_123...
MAGIC_SECRET_KEY=sk_live_123...
```

# Introduction

Magic is a passwordless authentication sdk that lets you plug and play different auth methods into your app. Magic supports passwordless email login via magic links, social login (such as Login with Google), and WebAuthn (a protocol that lets users authenticate a hardware device using either a YubiKey or fingerprint). This app will walk through implementing magic link and social logins.

## File Structure

```txt
├── README.md
├── components
│   ├── email-form.js
│   ├── header.js
│   ├── layout.js
│   ├── loading.js
│   └── social-logins.js
├── lib
│   ├── UserContext.js
│   └── magic.js
├── package.json
├── pages
│   ├── _app.js
│   ├── _document.js
│   ├── api
│   │   └── login.js
│   ├── callback.js
│   ├── index.js
│   ├── login.js
│   └── profile.js
├── public
│   └── (images)
└── yarn.lock
```

## Magic Setup

Your Magic setup will depend on what login options you want. For magic links, minimal setup is required. For social logins, follow our [**documentation**](https://docs.magic.link/social-login) for configuration instructions.

Once you have social logins configured (if applicable), grab your API keys from Magic’s dashboard and in `.env.local` enter your Test Publishable Key such as `NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=pk_test_1234567890` and your Test Secret Key such as `MAGIC_SECRET_KEY=sk_test_1234567890`.

# Client

## Keeping Track of the User

This example app will keep track of the logged in user by using React's `useContext` hook. Inside `_app.js`, wrap the entire app in the `<UserContext.Provider>` so all child components down the component tree have access to see if the user is logged in or not (`UserContext` is exported from `lib/UserContext`). Once a user logs in with Magic, unless they log out, they'll remian logged in for 7 days until their session expires.

```js
// If isLoggedIn is true, set the UserContext with user data
// Otherwise, redirect to /login and set UserContext to { user: null }
useEffect(() => {
  setUser({ loading: true });
  magic.user.isLoggedIn().then((isLoggedIn) => {
    if (isLoggedIn) {
      magic.user.getMetadata().then((userData) => setUser(userData));
    } else {
      Router.push('/login');
      setUser({ user: null });
    }
  });
}, []);

return (
  <UserContext.Provider value={[user, setUser]}>
    <Layout>
      <Component {...pageProps} />
    </Layout>
  </UserContext.Provider>
);
```

## Magic Link Auth

In `pages/login.js`, handle `magic.auth.loginWithMagicLink()` which is what triggers the magic link to be emailed to the user. It takes an object with two parameters, `email` and an optional `redirectURI`. Magic allows you to configure the email link to open up a new tab, bringing the user back to your application. With the redirect in place, a user will get logged in on both the original and new tab. Once the user clicks the email link, send the `didToken` to the server endpoint at `/api/login` to validate it, and if the token is valid, set the `UserContext` and redirect to the profile page.

```js
async function handleLoginWithEmail(email) {
  // Trigger Magic link to be sent to user
  let didToken = await magic.auth.loginWithMagicLink({
    email,
    redirectURI: new URL('/callback', window.location.origin).href, // optional redirect back to your app after magic link is clicked
  });

  // Validate didToken with server
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + didToken,
    },
  });

  if (res.status === 200) {
    // Set the UserContext to the now logged in user
    let userMetadata = await magic.user.getMetadata();
    await setUser(userMetadata);
    Router.push('/profile');
  }
}
```

## Social Logins

The social login implementation is similar. `magic.oauth.loginWithRedirect()` takes an object with a `provider`, and a required `redirectURI` for where to redirect back to once the user authenticates with the social provider and with Magic. In this case, the user will get redirected to `http://localhost:3000/callback`.

```js
function handleLoginWithSocial(provider) {
  magic.oauth.loginWithRedirect({
    provider, // google, apple, etc
    redirectURI: new URL('/callback', window.location.origin).href, // required redirect to finish social login
  });
}
```

## Handling Redirect

In the `/callback` page, check if the query parameters include a `provider`, and if so, finish the social login, otherwise, it’s a user completing the email login.

```js
// The redirect contains a `provider` query param if the user is logging in with a social provider
useEffect(() => {
  router.query.provider ? finishSocialLogin() : finishEmailRedirectLogin();
}, [router.query]);

// `getRedirectResult()` returns an object with user data from Magic and the social provider
const finishSocialLogin = async () => {
  let result = await magic.oauth.getRedirectResult();
  authenticateWithServer(result.magic.idToken);
};

// `loginWithCredential()` returns a didToken for the user logging in
const finishEmailRedirectLogin = () => {
  if (router.query.magic_credential)
    magic.auth.loginWithCredential().then((didToken) => authenticateWithServer(didToken));
};

// Send token to server to validate
const authenticateWithServer = async (didToken) => {
  let res = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + didToken,
    },
  });

  if (res.status === 200) {
    // Set the UserContext to the now logged in user
    let userMetadata = await magic.user.getMetadata();
    await setUser(userMetadata);
    Router.push('/profile');
  }
};
```

## Logout

Users also need to be able to log out. In `header.js`, add a `logout` function to end the user's session with Magic, clear the user from the UserContext, and redirect back to the login page.

```js
const logout = () => {
  magic.user.logout().then(() => {
    setUser({ user: null });
    Router.push('/login');
  });
};
```

# Server

## Validating the Auth Token (didToken)

In the `/api/login` route, simply verify the `DID token`, then send a `200` back to the client.

```js
export default async function login(req, res) {
  try {
    const didToken = req.headers.authorization.substr(7);
    await magic.token.validate(didToken);
    res.status(200).json({ authenticated: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

That's it! You now have a working Next.js app that includes Magic authentication for both magic links and social logins.

## Deploying to Vercel

Follow [this guide](https://magic.link/posts/magic-link-nextjs) for deploying to Vercel
