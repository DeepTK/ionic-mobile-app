import { useEffect, useRef, useState } from 'react';
import {
  IonAvatar,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSkeletonText,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { fetchUsers, type User } from '../services/users';

const BATCH_SIZE = 4;
const TEST_REPEAT_COUNT = 6;
const INITIAL_VISIBLE_COUNT = 15;

const getUserAvatar = (userId: number) => `https://i.pravatar.cc/300?img=${(userId % 70) + 1}`;
const getSourceUserId = (userId: number) => ((userId - 1) % 10) + 1;

const buildInfiniteUsers = (users: User[]): User[] => {
  return Array.from({ length: TEST_REPEAT_COUNT }, (_, batchIndex) =>
    users.map((user) => ({
      ...user,
      id: user.id + batchIndex * users.length,
    }))
  ).flat();
};

const UsersSection: React.FC = () => {
  const history = useHistory();
  const isNavigatingRef = useRef(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [visibleUsers, setVisibleUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const users = await fetchUsers();
      const expandedUsers = buildInfiniteUsers(users);
      setAllUsers(expandedUsers);
      setVisibleUsers(expandedUsers.slice(0, INITIAL_VISIBLE_COUNT));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const loadMoreUsers = (event: CustomEvent<void>) => {
    const nextCount = visibleUsers.length + BATCH_SIZE;
    setVisibleUsers(allUsers.slice(0, nextCount));
    const infiniteScroll = event.target as HTMLIonInfiniteScrollElement | null;
    infiniteScroll?.complete();
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };

  const viewUserDetails = () => {
    if (!selectedUser || isNavigatingRef.current) {
      return;
    }

    isNavigatingRef.current = true;
    const userId = getSourceUserId(selectedUser.id);
    closeUserModal();
    history.push(`/users/${userId}`);
    window.setTimeout(() => {
      isNavigatingRef.current = false;
    }, 400);
  };

  if (isLoading) {
    return (
      <IonList inset aria-busy="true">
        {Array.from({ length: 10 }).map((_, index) => (
          <IonItem key={index}>
            <IonAvatar slot="start">
              <IonSkeletonText animated style={{ width: 40, height: 40, borderRadius: 999 }} />
            </IonAvatar>
            <IonLabel>
              <h2>
                <IonSkeletonText animated style={{ width: '70%' }} />
              </h2>
              <p>
                <IonSkeletonText animated style={{ width: '40%' }} />
              </p>
            </IonLabel>
          </IonItem>
        ))}
      </IonList>
    );
  }

  if (error) {
    return (
      <IonItem color="danger" lines="none">
        <IonLabel>{error}</IonLabel>
        <IonButton slot="end" fill="clear" className="btn-inline" onClick={() => void loadUsers()}>
          Retry
        </IonButton>
      </IonItem>
    );
  }

  return (
    <>
      <IonList inset>
        {visibleUsers.map((user) => (
          <IonItem key={user.id} button detail onClick={() => openUserModal(user)}>
            <IonAvatar slot="start">
              <img src={getUserAvatar(user.id)} alt={user.name} />
            </IonAvatar>
            <IonLabel>
              <h2>{user.name}</h2>
              <p>@{user.username}</p>
            </IonLabel>
          </IonItem>
        ))}
      </IonList>

      <IonInfiniteScroll
        threshold="100px"
        onIonInfinite={(event) => loadMoreUsers(event)}
        disabled={visibleUsers.length >= allUsers.length}
      >
        <IonInfiniteScrollContent loadingText="Loading more users..." />
      </IonInfiniteScroll>

      <IonModal
        isOpen={isUserModalOpen && selectedUser !== null}
        onDidDismiss={closeUserModal}
        className="sheet-modal"
        initialBreakpoint={1}
        breakpoints={[0, 0.72, 1]}
      >
        {selectedUser && (
          <IonCard className="sheet-card">
            <img
              className="card-media"
              alt={selectedUser.name}
              src={getUserAvatar(selectedUser.id)}
            />
            <IonCardHeader>
              <IonCardTitle className="card-title">{selectedUser.name}</IonCardTitle>
              <IonCardSubtitle className="card-subtitle">@{selectedUser.username}</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <p>Email: {selectedUser.email}</p>
              <p>Phone: {selectedUser.phone}</p>
              <p>Website: {selectedUser.website}</p>
              <p>
                Address: {selectedUser.address.city}, {selectedUser.address.street}
              </p>
              <p>Company: {selectedUser.company.name}</p>
              <div className="sheet-actions">
                <IonButton expand="block" className="btn-primary" onClick={viewUserDetails}>
                  View full profile
                </IonButton>
                <IonButton expand="block" fill="clear" className="btn-ghost" onClick={closeUserModal}>
                  Close
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}
      </IonModal>
    </>
  );
};

export default UsersSection;
