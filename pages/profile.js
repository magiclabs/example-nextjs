import Layout from '../components/layout';
import { useUser, useWebauthn } from '../lib/hooks';

const Profile = () => {
  const user = useUser({ redirectTo: '/login' });
  const webauthnData = useWebauthn();

  return (
    <Layout>
      <h2 className='user-header'>User</h2>
      {user && (
        <>
          <pre className='code-snippet'>
            {JSON.stringify(
              { issuer: user.issuer, publicAddress: user.publicAddress, email: user.email },
              null,
              2
            )}
          </pre>
          <h2 className='jwt-header'>Session Token (JWT)</h2>
          <div className='code-snippet'>{user.token}</div>
          {/* if email field is null, the user logged in with webauthn, show device metadata */}
          {!user.email && (
            <>
              <h2 className='jwt-header'>WebAuthn Device</h2>
              <div className='code-snippet'>{JSON.stringify(webauthnData, null, 2)}</div>
            </>
          )}
        </>
      )}
      <style jsx>{`
        h2 {
          font-size: 22px;
        }
        .user-header {
          margin-top: 0px;
        }
        .jwt-header {
          margin-top: 30px;
        }
        .code-snippet {
          padding: 12px 15px;
          background: #efefef;
          word-wrap: break-word;
          white-space: pre-wrap;
          word-break: normal;
          border: 1px solid #ccc;
          color: #77838f;
          border-radius: 6px;
          font-family: monospace !important;
        }
      `}</style>
    </Layout>
  );
};

export default Profile;
