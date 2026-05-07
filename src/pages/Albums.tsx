import { IonContent, IonPage } from '@ionic/react';
import { useHeaderOptions } from '../layouts/HeaderControlsContext';
import AlbumsSection from '../components/AlbumsSection';

const Albums: React.FC = () => {
  useHeaderOptions({ showBack: false, backHref: '/post' });

  return (
    <IonPage>
      <IonContent>
        <AlbumsSection />
      </IonContent>
    </IonPage>
  );
};

export default Albums;
