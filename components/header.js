import Link from 'next/link';
import { useUser } from '../lib/hooks';

const Header = () => {
  const user = useUser();
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link href='/'>
              <a>Home</a>
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link href='/profile'>
                  <a>Profile</a>
                </Link>
              </li>
              <li>
                <a href='/api/logout'>Logout</a>
              </li>
            </>
          ) : (
            <li>
              <Link href='/login'>
                <a>Login</a>
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <style jsx>{`
        nav {
          max-width: 45rem;
          margin: 0 auto 50px;
          padding: 0.2rem 1.25rem;
        }
        ul {
          display: flex;
          list-style: none;
        }
        li {
          margin-right: 1rem;
        }
        li:first-child {
          margin-left: auto;
        }
        a {
          color: #fff;
          text-decoration: none;
        }
        header {
          color: #ccc;
          background-color: #212121;
        }
      `}</style>
    </header>
  );
};

export default Header;
