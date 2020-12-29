import { useState } from 'react';
import Webauthn from './webauthn';
import { validateEmail } from '../lib/helpers';

const Form = ({ onEmailSubmit, disabled, onWebauthnSubmit, isLoading }) => {
  const [email, setEmail] = useState('');

  return (
    <>
      <form>
        <h3>Login</h3>
        <label>
          <input
            type='email'
            name='email'
            value={email}
            required
            placeholder='Email'
            className='email-input'
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <div className='submit'>
          <button
            type='submit'
            disabled={disabled}
            onClick={(e) => {
              e.preventDefault();
              email && validateEmail(email) && onEmailSubmit(email);
            }}
          >
            Send Magic Link
          </button>
          <Webauthn onSubmit={onWebauthnSubmit} email={email} isLoading={isLoading} />
        </div>
      </form>
      <style jsx>{`
        form,
        label {
          display: flex;
          flex-flow: column;
          text-align: center;
        }
        .email-input {
          padding: 10px;
          margin: 1rem auto;
          border: 1px solid #ccc;
          border-radius: 50px;
          transition: 0.5s;
          width: 80%;
          background-image: url(mail.png);
          background-size: 18px;
          background-repeat: no-repeat;
          background-position: 5% 50%;
          padding-left: 43px;
        }
        .email-input:focus {
          border: 1px solid #888;
        }
        .submit {
          display: flex;
          justify-content: space-between;
          width: 80%;
          margin: 0 auto;
        }
        .submit > button {
          padding: 0.6rem 1rem;
          cursor: pointer;
          background: #fff;
          border: 1px solid #ccc;
          border-radius: 50px;
          transition: 0.3s;
          font-size: 13px;
          background-image: url(airplane.png);
          background-size: 21px;
          background-repeat: no-repeat;
          background-position: 12% 50%;
          padding-left: 38px;
          width: 80%;
        }
        .submit > button:hover {
          border-color: #888;
        }
      `}</style>
    </>
  );
};

export default Form;
