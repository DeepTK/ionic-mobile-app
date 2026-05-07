import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonSkeletonText,
  IonText,
} from '@ionic/react';
import { callOutline, globeOutline, mailOutline } from 'ionicons/icons';
import { fetchUserById, type User } from '../services/users';
import { useHeaderOptions } from '../layouts/HeaderControlsContext';

type UserRouteParams = {
  id: string;
};

type DetailRowProps = {
  label: string;
  value: string;
  lines?: 'full' | 'none';
};

const DetailRow: React.FC<DetailRowProps> = ({ label, value, lines = 'full' }) => (
  <IonItem lines={lines} className="user-details-row">
    <IonLabel className="user-details-row-label">{label}</IonLabel>
    <IonText className="user-details-row-value">{value}</IonText>
  </IonItem>
);

const UserDetails: React.FC = () => {
  const { id } = useParams<UserRouteParams>();
  useHeaderOptions({ showBack: true, backHref: '/users' });
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    const userId = Number(id);
    if (Number.isNaN(userId)) {
      setError('Invalid user id');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchUserById(userId);
      setUser(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load user');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const getWebsiteHref = (website: string) => {
    if (website.startsWith('http://') || website.startsWith('https://')) {
      return website;
    }
    return `https://${website}`;
  };

  return (
    <IonPage className="user-details-page">
      <IonContent className="user-details-content">
        {isLoading && (
          <IonCard className="sheet-card user-details-card" aria-busy="true">
            <div className="card-media user-details-skeleton-media">
              <IonSkeletonText animated style={{ width: '100%', height: '100%' }} />
            </div>
            <IonCardHeader>
              <IonCardTitle className="card-title">
                <IonSkeletonText animated style={{ width: '58%' }} />
              </IonCardTitle>
              <IonCardSubtitle className="card-subtitle">
                <IonSkeletonText animated style={{ width: '28%' }} />
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="user-details-actions">
                <IonSkeletonText animated style={{ width: '100%', height: 42 }} />
                <IonSkeletonText animated style={{ width: '100%', height: 42 }} />
                <IonSkeletonText animated style={{ width: '100%', height: 42 }} />
              </div>
              <IonList inset className="user-details-section">
                <IonListHeader>
                  <IonLabel>Contact</IonLabel>
                </IonListHeader>
                <IonItem>
                  <IonLabel>
                    <IonSkeletonText animated style={{ width: '36%' }} />
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <IonSkeletonText animated style={{ width: '52%' }} />
                  </IonLabel>
                </IonItem>
                <IonItem lines="none">
                  <IonLabel>
                    <IonSkeletonText animated style={{ width: '40%' }} />
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {!isLoading && error && (
          <IonCard className="sheet-card user-details-card">
            <IonCardContent>
              <IonItem color="danger" lines="none">
                <IonLabel>{error}</IonLabel>
              </IonItem>
              <div className="user-details-actions">
                <IonButton expand="block" className="btn-primary" onClick={() => void loadUser()}>
                  Retry
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {!isLoading && user && (
          <IonCard className="sheet-card user-details-card">
            <img
              alt={user.name}
              src={`https://i.pravatar.cc/800?img=${(user.id % 70) + 1}`}
              className="card-media"
            />
            <IonCardHeader>
              <IonCardTitle className="card-title">{user.name}</IonCardTitle>
              <IonCardSubtitle className="card-subtitle">@{user.username}</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="user-details-actions">
                <IonButton
                  expand="block"
                  className="btn-primary"
                  href={`mailto:${user.email}`}
                  aria-label={`Email ${user.name}`}
                >
                  <IonIcon icon={mailOutline} slot="start" />
                  Email
                </IonButton>
                <IonButton
                  expand="block"
                  fill="outline"
                  className="btn-secondary"
                  href={`tel:${user.phone}`}
                  aria-label={`Call ${user.name}`}
                >
                  <IonIcon icon={callOutline} slot="start" />
                  Call
                </IonButton>
                <IonButton
                  expand="block"
                  fill="clear"
                  className="btn-ghost"
                  href={getWebsiteHref(user.website)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${user.name} website`}
                >
                  <IonIcon icon={globeOutline} slot="start" />
                  Website
                </IonButton>
              </div>

              <IonList inset className="user-details-section">
                <IonListHeader>
                  <IonLabel>Contact</IonLabel>
                </IonListHeader>
                <DetailRow label="Email" value={user.email} />
                <DetailRow label="Phone" value={user.phone} />
                <DetailRow label="Website" value={user.website} lines="none" />
              </IonList>

              <IonList inset className="user-details-section">
                <IonListHeader>
                  <IonLabel>Address</IonLabel>
                </IonListHeader>
                <DetailRow label="Street" value={`${user.address.street} ${user.address.suite}`} />
                <DetailRow label="City" value={user.address.city} />
                <DetailRow label="Zip" value={user.address.zipcode} />
                <DetailRow label="Geo" value={`${user.address.geo.lat}, ${user.address.geo.lng}`} lines="none" />
              </IonList>

              <IonList inset className="user-details-section">
                <IonListHeader>
                  <IonLabel>Company</IonLabel>
                </IonListHeader>
                <DetailRow label="Name" value={user.company.name} />
                <DetailRow label="Catch phrase" value={user.company.catchPhrase} />
                <DetailRow label="Business" value={user.company.bs} lines="none" />
              </IonList>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default UserDetails;
