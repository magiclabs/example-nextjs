import ReactTooltip from 'react-tooltip';

const Webauthn = ({ onSubmit, email, isLoading, setInvalidEmailError }) => {
  return (
    <>
      <button
        type='submit'
        data-tip
        data-for='webauthn-btn'
        onClick={(e) => {
          e.preventDefault();
          !email ? setInvalidEmailError(true) : onSubmit(email);
        }}
      >
        .
      </button>
      <ReactTooltip id='webauthn-btn' type='dark' effect='solid' place='bottom'>
        <div>WebAuthn</div>
      </ReactTooltip>
      <style jsx>{`
        button {
          padding: 0.6rem 1rem;
          cursor: pointer;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 50px;
          width: 80%;
          outline: none;
          transition: 0.3s;
          margin: 0 auto;
          font-size: 13px;
          width: 16%;
          height: 100%;
          color: transparent;
          background-image: ${!isLoading
            ? 'url(webauthn.png)'
            : 'url(https://media.tenor.com/images/9da8a7cec33307a43306a32e54fbaca0/tenor.gif)'};
          background-size: 21px;
          background-repeat: no-repeat;
          background-position: 50%;
        }
        button:hover {
          border-color: #888;
        }
      `}</style>
    </>
  );
};

export default Webauthn;
