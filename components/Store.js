import { createContext, useState, useEffect } from "react";
import { Magic } from "magic-sdk";
import Layout from "./Layout";

/* initializing context API values */
export const MagicContext = createContext();
export const LoggedInContext = createContext();
export const LoadingContext = createContext();

/* this function wraps our entire app within our context APIs so they all have access to their values */
const Store = ({ children }) => {
  const [magic, setMagic] = useState();
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      /* We initialize Magic in `useEffect` so it has access to the global `window` object inside the browser */
      let m = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY);
      await setMagic(m);

      /* On page refresh, send a request to /api/user to see if there's a valid user session */
      let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user`);
      let data = await res.json();

      /* If the user has a valid session with our server, it will return {authorized: true, user: user} */
      let loggedIn = data.authorized ? data.user : false;

      /* If db returns {authorized: false}, there is no valid session, so log user out of their session with Magic if it exists */
      !loggedIn && magic && magic.user.logout();

      await setLoggedIn(loggedIn.email);
      setIsLoading(false);
    })();
  }, []);

  return (
    // `children` (passed as props in this file) represents the component nested inside <Store /> in `/pages/index.js` and `/pages/login.js`
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
