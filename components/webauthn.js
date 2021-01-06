import ReactTooltip from 'react-tooltip';
import { MonochromeIcons, Icon } from '@magiclabs/ui';

const Webauthn = ({ onSubmit, email, addToast }) => {
  return (
    <>
      <div>
        <Icon
          type={MonochromeIcons.Fingerprint}
          size={36}
          data-tip
          data-for='webauthn-btn'
          onClick={(e) => {
            e.preventDefault();
            !email ? addToast() : onSubmit(email);
          }}
        />
      </div>
      <ReactTooltip id='webauthn-btn' type='dark' effect='solid' place='bottom'>
        <div>WebAuthn</div>
      </ReactTooltip>
      <style jsx>{`
        div {
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default Webauthn;
