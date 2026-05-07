import { IonMenuButton } from '@ionic/react';

const SidebarToggle: React.FC = () => {
  return (
    <IonMenuButton
      menu="main-menu"
      autoHide={false}
      aria-label="Open menu"
      className="app-menu-toggle"
    />
  );
};

export default SidebarToggle;
