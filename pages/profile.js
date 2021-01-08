import Layout from '../components/layout';
import { useUser } from '../lib/hooks';
import { MonochromeIcons, Icon } from '@magiclabs/ui';

const Profile = () => {
  const user = useUser({ redirectTo: '/login' });

  return (
    <Layout>
      {user && (
        <>
          <div>
            <div className='profile-item-container'>
              <div className='icon'>
                <Icon type={MonochromeIcons.Envelope} size={26} />
              </div>
              <div>
                <div className='label'>Email</div>
                <div className='profile-info'>{user.email}</div>
              </div>
            </div>
            <div className='profile-item-container'>
              <div className='icon'>
                <Icon type={MonochromeIcons.Profile} size={30} />
              </div>
              <div>
                <div className='label'>User Id</div>
                <div className='profile-info'>{user.issuer}</div>
              </div>
            </div>
          </div>
        </>
      )}
      <style jsx>{`
        h2 {
          font-size: 22px;
        }
        div {
          word-wrap: break-word;
          white-space: pre-wrap;
          word-break: normal;
          overflow: hidden;
        }
        .user-header {
          margin-top: 0px;
        }
        .profile-item-container {
          display: flex;
          margin: 20px auto;
        }
        .icon {
          margin-right: 25px;
          line-height: 50px;
        }
        .label {
          font-size: 11px;
          color: #6851ff;
          margin-bottom: 4px;
        }
        .profile-info {
          font-size: 17px;
        }
      `}</style>
    </Layout>
  );
};

export default Profile;
