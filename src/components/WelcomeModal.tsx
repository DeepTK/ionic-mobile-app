import { useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonModal,
  IonProgressBar,
} from '@ionic/react';
import { lockClosedOutline, rocketOutline, sparklesOutline } from 'ionicons/icons';

type WelcomeModalProps = {
  isOpen: boolean;
  onDone: () => void;
  onDismiss: () => void;
};

const welcomeSteps = [
  {
    title: 'Welcome to Circle',
    description: 'Browse posts, users, and albums in a clean, focused mobile experience.',
    icon: sparklesOutline,
  },
  {
    title: 'Navigate Fast',
    description: 'Use the bottom tabs for primary pages and the sidebar for quick settings.',
    icon: rocketOutline,
  },
  {
    title: 'Personalize Appearance',
    description: 'Switch dark mode anytime. Your theme preference is saved automatically.',
    icon: lockClosedOutline,
  },
];

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onDone, onDismiss }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const activeStep = welcomeSteps[currentStep];
  const progressValue = (currentStep + 1) / welcomeSteps.length;

  const handleDone = () => {
    setCurrentStep(0);
    onDone();
  };

  const handleDismiss = () => {
    setCurrentStep(0);
    onDismiss();
  };

  const goNextStep = () => {
    if (currentStep >= welcomeSteps.length - 1) {
      handleDone();
      return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const goPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    handleDone();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={handleDismiss}
      backdropDismiss={false}
      className="welcome-modal"
    >
      <div className="welcome-modal-content">
        <div className="welcome-shell">
          <div className="welcome-topbar">
            <h2 className="welcome-modal-title">Welcome</h2>
            <IonButton fill="clear" className="btn-inline welcome-skip" onClick={handleSkip}>
              Skip
            </IonButton>
          </div>

          <IonProgressBar value={progressValue} className="welcome-progress" />
          <div className="welcome-step-dots" aria-hidden="true">
            {welcomeSteps.map((step, index) => (
              <span
                key={step.title}
                className={`welcome-step-dot ${index === currentStep ? 'is-active' : ''}`}
              />
            ))}
          </div>

          <IonCard className="welcome-card">
            <IonCardContent className="welcome-card-content">
              <div className="welcome-step-icon-wrap">
                <IonIcon icon={activeStep.icon} color="primary" className="welcome-step-icon" />
              </div>
              <div className="welcome-step-copy">
                <h3>{activeStep.title}</h3>
                <p>{activeStep.description}</p>
              </div>
            </IonCardContent>
          </IonCard>
          <p className="welcome-step-text">
            Step {currentStep + 1} of {welcomeSteps.length}
          </p>

          <div className="welcome-actions">
          <IonButton
            fill="clear"
            className="btn-ghost"
            disabled={currentStep === 0}
            onClick={goPreviousStep}
          >
            Back
          </IonButton>
          <IonButton className="btn-primary" onClick={goNextStep}>
            {currentStep === welcomeSteps.length - 1 ? 'Done' : 'Next'}
          </IonButton>
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default WelcomeModal;
