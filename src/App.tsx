import { useEffect, useState } from 'react';
import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import WelcomeModal from './components/WelcomeModal';
import AppLayout from './layouts/AppLayout';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
import '@ionic/react/css/palettes/dark.class.css';
import './app.css';
import './styles/tokens.css';
import './styles/components.css';

setupIonicReact();

const App: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('ion-palette-dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('welcome-modal-seen');
    setShowWelcomeModal(!hasSeenWelcome);
  }, []);

  const handleWelcomeDone = () => {
    localStorage.setItem('welcome-modal-seen', 'true');
    setShowWelcomeModal(false);
  };

  const handleWelcomeDismiss = () => {
    setShowWelcomeModal(false);
  };

  return (
    <IonApp>
      <IonReactRouter>
        <AppLayout isDark={isDark} onToggleTheme={setIsDark} />
        <WelcomeModal
          isOpen={showWelcomeModal}
          onDone={handleWelcomeDone}
          onDismiss={handleWelcomeDismiss}
        />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
