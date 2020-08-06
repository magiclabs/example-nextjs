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
