## Demo

Live at https://magic-nextjs.vercel.app/login

## Quick Start

```
$ git clone https://github.com/magiclabs/example-nextjs
$ cd example-nextjs
$ mv .env.local.example .env.local
// fill out your .env files
// if you want social logins, follow our setup guide https://docs.magic.link/social-login
$ yarn install
$ yarn dev // opens server in http://localhost:3000
```

#### Environment Variables

```
NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=get-this-from-https://dashboard.magic.link/login
MAGIC_SECRET_KEY=get-this-from-https://dashboard.magic.link/login
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
JWT_SECRET=your-secret-password
```

## Walkthrough

### Introduction

Magic is a passwordless authentication sdk that lets you plug and play different auth methods into your app. Magic supports passwordless email login via magic links, social login (such as Login with Google), and WebAuthn (a protocol that lets users authenticate a hardware device using either a YubiKey or fingerprint via a username).

We’ll be building an application that integrates Magic auth (magic link, social and webauthn login). This tutorial is broken out into two parts. The tutorial will not be line-by-line, but show you how to implement the core functionality.

The application we build will follow this flow. A user completes any of the auth methods --> we are returned a decentralized Id (DID) token, which is Magic's proof of authentication --> send it to our server to validate --> our server issues a JWT inside a cookie --> on subsequent requests to the server, we validate the JWT to keep sessions persisting.

### Magic Setup

Your Magic setup will depend on what login options you want. For magic link and webauthn, minimal setup is required. For social login integrations, follow our documentation for configuration instructions.

Once you have social logins configured (if applicable), grab your API keys from Magic’s dashboard and in `.env.local` enter your Test/Live Publishable Key such as `NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY=pk_test1234567890` and your Test/Live Secret Key such as `MAGIC_SECRET_KEY=sk_test_1234567890`.

### Magic Link Auth

In `pages/login.js`, we handle `magic.user.loginWithMagicLink()` which is what triggers the magic link to be emailed to the user. It takes an object with two parameters, email and an optional redirectURI. Magic allows you to have the magic link open up a new tab, bringing the user back to your application, and the redirectURI specifies where the user gets redirected to. `loginWithMagicLink` returns a promise, which resolves to a DID token when the link is clicked. We then send the DID token to `/api/login` where we validate it.

```js
async function handleLoginWithEmail(email) {
  try {
    let didToken = await magic.auth.loginWithMagicLink({
      email,
      redirectURI: `${process.env.NEXT_PUBLIC_SERVER_URL}/callback`,
    });
    authenticateWithServer(didToken);
  } catch (error) {
    // handle error
  }
}

async function authenticateWithServer(didToken) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + didToken,
    },
  });
  // redirect user home if successful
}
```

With Magic, users always get logged in in the original tab, so even if a user requests to login from their computer, but clicks the link in the email app on their phone, they will still get logged in in both places if you have the redirectURI in place. When you specify the redirectURI, you need to configure a callback page where you complete the login on redirect.

### Social Login Auth

The social login implementation is similar. `magic.loginWithRedirect()` takes an object with provider, and a redirectURI for where to redirect back to once the user is authenticated. We authenticate with the server on the /callback page.

```js
async function handleLoginWithSocial(provider) {
  await magic.oauth.loginWithRedirect({
    provider, // 'google', 'apple', etc
    redirectURI: `${process.env.NEXT_PUBLIC_SERVER_URL}/callback`,
  });
}
```

### WebAuthn

Finally, you can let users log into your app with just a fingerprint (on supported browsers) or yubikey. This is powered by the WebAuthn protocol, and allows users to register and login with their hardware device. The low-level implementation of WebAuthn has a different flow for registering and logging in, but to keep from breaking out our form into login and signup for WebAuthn, we check if the login fails, and if so, we retry by registering the device.

```js
async function handleLoginWithWebauthn(email) {
  try {
    let didToken = await magic.webauthn.login({ username: email });
    authenticateWithServer(didToken);
  } catch (error) {
    try {
      let didToken = await magic.webauthn.registerNewUser({ username: email });
      authenticateWithServer(didToken);
    } catch (error) {
      // handle error
    }
  }
}
```

### Completing the Login Redirect

In the `/callback` page, we need to check if the query parameters include a `provider`, and if so, we finish the social login, otherwise, we know it’s a user completing the email login.

```js
useEffect(() => {
  !magic &&
    setMagic(
      new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY, {
        extensions: [new OAuthExtension()],
      })
    );
  magic && router.query.provider ? finishSocialLogin() : finishEmailRedirectLogin();
}, [magic, router.query]);

const finishSocialLogin = async () => {
  try {
    let {
      magic: { idToken },
    } = await magic.oauth.getRedirectResult();
    await authenticateWithServer(idToken);
  } catch (error) {
    // handle error
  }
};

const finishEmailRedirectLogin = async () => {
  if (router.query.magic_credential) {
    try {
      let didToken = await magic.auth.loginWithCredential();
      await authenticateWithServer(didToken);
    } catch (error) {
      // handle error
    }
  }
};
```

### Server-side

On our backend, inside `/api/login`, we verify the DID token, create a JWT, then set it inside a cookie. On subsequent requests to the server, to check if the user is already authenticated for example, all we have to do is verify the JWT to know if the user has already been authenticated, and is authorized.

```js
export default async function login(req, res) {
  try {
    const didToken = req.headers.authorization.substr(7);
    await magic.token.validate(didToken);
    const metadata = await magic.users.getMetadataByToken(didToken);
    let token = jwt.sign(
      { ...metadata, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }, // one week
      process.env.JWT_SECRET
    );
    setTokenCookie(res, token);
    res.status(200).send({ done: true });
  } catch (error) {
    res.status(error.status || 500).end(error.message);
  }
}
```

### Persisting Sessions

To make sessions persist, we rely on the JWT that’s stored in a cookie and automatically sent on each request to our server. The endpoint we set up for this is `/api/user`. Leveraging Vercel’s SWR (stale while revalidate), we send a request to our server with the JWT which verifies the authenticity of the token, and as long as we get a user returned, we know it’s valid and to keep the user logged in.

```js
const fetchUser = (url) =>
  fetch(url)
    .then((r) => r.json())
    .then((data) => {
      return { user: data?.user || null };
    });

export function useUser({ redirectTo, redirectIfFound } = {}) {
  const { data, error } = useSWR('/api/user', fetchUser);
  const user = data?.user;
  const finished = Boolean(data);
  const hasUser = Boolean(user);

  useEffect(() => {
    if (!redirectTo || !finished) return;
    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !hasUser) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && hasUser)
    ) {
      Router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, finished, hasUser]);
  return error ? null : user;
}
```

### Logout

To complete the authentication, we need to allow users to log out. In `/api/logout` we use Magic’s admin-sdk method to clear the cookie containing the JWT and log the user out of their session with Magic.

```js
export default async function logout(req, res) {
  try {
    let token = req.cookies.token;
    let user = jwt.verify(token, process.env.JWT_SECRET);
    await magic.users.logoutByIssuer(user.issuer);
    removeTokenCookie(res);
    res.writeHead(302, { Location: '/login' });
    res.end();
  } catch (error) {
    // handle error
  }
}
```

### Conclusion

At this point, we have a working app with authentication and session management through JWTs. The developer is able to control how long users stay logged in for, just by editing the cookie’s MAX_AGE in the `cookie.js` file and the `exp` in `/api/login.js`.
