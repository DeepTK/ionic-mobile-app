import { Redirect, Route, useLocation } from 'react-router-dom';
import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { useState } from 'react';
import { albumsOutline, documentTextOutline, peopleOutline } from 'ionicons/icons';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Home from '../pages/Home';
import Users from '../pages/Users';
import Albums from '../pages/Albums';
import UserDetails from '../pages/UserDetails';
import { HeaderControlsContext, type HeaderOptions } from './HeaderControlsContext';

type AppLayoutProps = {
  isDark: boolean;
  onToggleTheme: (checked: boolean) => void;
};

const routeTitles: Record<string, string> = {
  '/post': 'Post',
  '/users': 'Users',
  '/albums': 'Albums',
};

const AppLayout: React.FC<AppLayoutProps> = ({ isDark, onToggleTheme }) => {
  const location = useLocation();
  const [headerOptions, setHeaderOptions] = useState<HeaderOptions>({
    showBack: false,
    backHref: '/post',
  });
  const currentTitle = location.pathname.startsWith('/users/')
    ? 'User Details'
    : (routeTitles[location.pathname] ?? 'Circle');

  return (
    <HeaderControlsContext.Provider value={{ setHeaderOptions }}>
      <Sidebar isDark={isDark} onToggleTheme={onToggleTheme} />
      <Header title={currentTitle} showBack={headerOptions.showBack} backHref={headerOptions.backHref} />
      <IonTabs>
        <IonRouterOutlet id="main-content">
          <Route exact path="/post">
            <Home />
          </Route>
          <Route exact path="/users">
            <Users />
          </Route>
          <Route exact path="/users/:id">
            <UserDetails />
          </Route>
          <Route exact path="/albums">
            <Albums />
          </Route>
          <Route exact path="/">
            <Redirect to="/post" />
          </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="posts" href="/post">
            <IonIcon icon={documentTextOutline} />
            <IonLabel>Posts</IonLabel>
          </IonTabButton>
          <IonTabButton tab="users" href="/users">
            <IonIcon icon={peopleOutline} />
            <IonLabel>Users</IonLabel>
          </IonTabButton>
          <IonTabButton tab="albums" href="/albums">
            <IonIcon icon={albumsOutline} />
            <IonLabel>Albums</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </HeaderControlsContext.Provider>
  );
};

export default AppLayout;
