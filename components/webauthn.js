import { useState } from 'react';
import { MonochromeIcons, Icon, Tooltip } from '@magiclabs/ui';

const Webauthn = ({ onSubmit, email, addToast }) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <Tooltip
        placement='bottom'
        anchor={
          <div onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            <Icon
              type={MonochromeIcons.Fingerprint}
              size={36}
              onClick={(e) => {
                e.preventDefault();
                !email ? addToast() : onSubmit(email);
              }}
            />
          </div>
        }
        in={show}
        delay={0}
      >
        <div>WebAuthn</div>
      </Tooltip>
      <style jsx>{`
        div {
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default Webauthn;
