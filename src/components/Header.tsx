import { IonBackButton, IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import { chevronBack } from 'ionicons/icons';
import SidebarToggle from './SidebarToggle';

type HeaderProps = {
  title: string;
  showBack: boolean;
  backHref?: string;
};

const Header: React.FC<HeaderProps> = ({ title, showBack, backHref = '/post' }) => {
  return (
    <IonHeader className="app-header" translucent={false}>
      <IonToolbar className="app-header-toolbar">
        <IonButtons slot="start">
          {showBack ? (
            <IonBackButton
              defaultHref={backHref}
              text=""
              icon={chevronBack}
              className="app-back-button"
            />
          ) : (
            <SidebarToggle />
          )}
        </IonButtons>
        <IonTitle className="app-header-title">{title}</IonTitle>
        <IonButtons slot="end" className="app-header-actions" />
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
