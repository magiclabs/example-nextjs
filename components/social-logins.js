import { useState } from 'react';

const SocialLogins = ({ onSubmit }) => {
  const providers = ['apple', 'google', 'facebook', 'github'];
  const [isRedirecting, setIsRedirecting] = useState(false);

  return (
    <>
      <div className='or-login-with'>Or login with</div>
      {providers.map((provider) => {
        return (
          <div key={provider}>
            <button
              type='submit'
              className='social-btn'
              onClick={() => {
                setIsRedirecting(true);
                onSubmit(provider);
              }}
              key={provider}
              style={{ backgroundImage: `url(${provider}.png)` }}
            >
              {/* turns "google" to "Google" */}
              {provider.replace(/^\w/, (c) => c.toUpperCase())}
            </button>
          </div>
        );
      })}
      {isRedirecting && <div className='redirecting'>Redirecting...</div>}
      <style jsx>{`
        .or-login-with {
          margin: 25px 0;
          font-size: 12px;
          text-align: center;
          color: gray;
        }
        .social-btn {
          cursor: pointer;
          border-radius: 50px;
          margin-bottom: 20px;
          border: 1px solid #8a8a8a;
          padding: 9px 24px 9px 35px;
          width: 80%;

          background-color: #fff;
          background-size: 20px;
          background-repeat: no-repeat;
          background-position: 23% 50%;
        }
        .redirecting {
          color: gray;
          font-size: 12px;
          margin-bottom: 5px;
        }
      `}</style>
    </>
  );
};

export default SocialLogins;
