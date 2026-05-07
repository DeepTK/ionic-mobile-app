import { IonContent, IonPage } from '@ionic/react';
import { useHeaderOptions } from '../layouts/HeaderControlsContext';
import UsersSection from '../components/UsersSection';

const Users: React.FC = () => {
  useHeaderOptions({ showBack: false, backHref: '/post' });

  return (
    <IonPage>
      <IonContent>
        <UsersSection />
      </IonContent>
    </IonPage>
  );
};

export default Users;
