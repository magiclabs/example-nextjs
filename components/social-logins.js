const SocialLogins = ({ onSubmit }) => {
  const providers = ['google', 'facebook', 'github'];

  return (
    <>
      <div className='or-login-with'>Or login with</div>
      {providers.map((provider) => {
        return (
          <div key={provider}>
            <button
              type='submit'
              className='social-btn'
              onClick={() => onSubmit(provider)}
              key={provider}
              style={{ backgroundImage: `url(${provider}.png)` }}
            >
              {/* turns "google" to "Google" */}
              {provider.replace(/^\w/, (c) => c.toUpperCase())}
            </button>
          </div>
        );
      })}

      <style jsx>{`
        .or-login-with {
          margin-top: 25px;
          margin-bottom: 30px;
          font-size: 12px;
          color: gray;
          text-align: center;
        }
        .social-btn {
          border-radius: 50px;
          padding: 8px 10px;
          width: 80%;
          margin-bottom: 20px;
          font-size: 14px;
          border: 1px solid #ccc;
          cursor: pointer;
          outline: none;
          transition: 0.3s;
          background-color: #fff;
          background-size: 19px;
          background-repeat: no-repeat;
          background-position: 23% 50%;
          padding-left: 35px;
        }
        .social-btn:hover {
          border: 1px solid #888;
        }
      `}</style>
    </>
  );
};

export default SocialLogins;
