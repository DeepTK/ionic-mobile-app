import { useEffect, useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonCol,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonRow,
  IonSkeletonText,
  IonText,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { albumsOutline, personOutline } from 'ionicons/icons';
import { fetchAlbums, type Album } from '../services/albums';
import { fetchUserById, type User } from '../services/users';

const AlbumsSection: React.FC = () => {
  const history = useHistory();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedAlbumUser, setSelectedAlbumUser] = useState<User | null>(null);
  const [albumUserError, setAlbumUserError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const loadAlbums = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchAlbums(18);
      setAlbums(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load albums');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAlbums();
  }, []);

  if (isLoading) {
    return (
      <IonGrid fixed className="content-grid">
        <IonRow className="cards-row">
          {Array.from({ length: 6 }).map((_, index) => (
            <IonCol
              key={index}
              size="12"
              sizeSm="12"
              sizeMd="6"
              sizeLg="4"
              sizeXl="4"
              className="cards-col"
            >
              <IonCard className="card" aria-busy="true">
                <div className="card-media">
                  <IonSkeletonText animated style={{ width: '100%', height: '100%' }} />
                </div>
                <IonCardHeader>
                  <IonCardTitle className="card-title">
                    <IonSkeletonText animated style={{ width: '86%' }} />
                  </IonCardTitle>
                  <IonCardSubtitle className="card-subtitle">
                    <IonSkeletonText animated style={{ width: '44%' }} />
                  </IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonSkeletonText animated style={{ width: '64%' }} />
                  <IonSkeletonText animated style={{ width: '86%' }} />
                </IonCardContent>
              </IonCard>
            </IonCol>
          ))}
        </IonRow>
      </IonGrid>
    );
  }

  if (error) {
    return (
      <IonItem color="danger" lines="none">
        <IonLabel>{error}</IonLabel>
        <IonButton slot="end" fill="clear" className="btn-inline" onClick={() => void loadAlbums()}>
          Retry
        </IonButton>
      </IonItem>
    );
  }

  const openAlbumSheet = async (album: Album) => {
    setSelectedAlbum(album);
    setSelectedAlbumUser(null);
    setAlbumUserError(null);
    setIsSheetOpen(true);

    try {
      const user = await fetchUserById(album.userId);
      setSelectedAlbumUser(user);
    } catch (err) {
      setAlbumUserError(err instanceof Error ? err.message : 'Unable to load user');
    }
  };

  const closeAlbumSheet = () => {
    setIsSheetOpen(false);
    setSelectedAlbum(null);
    setSelectedAlbumUser(null);
    setAlbumUserError(null);
  };

  const goToUserDetails = () => {
    if (!selectedAlbum) {
      return;
    }
    closeAlbumSheet();
    history.push(`/users/${selectedAlbum.userId}`);
  };

  return (
    <>
      <IonGrid fixed className="content-grid">
        <IonRow className="cards-row">
          {albums.map((album) => (
            <IonCol
              key={album.id}
              size="12"
              sizeSm="12"
              sizeMd="6"
              sizeLg="4"
              sizeXl="4"
              className="cards-col"
            >
              <IonCard
                className="card"
                button
                onClick={() => openAlbumSheet(album)}
              >
                <img
                  alt={`Album ${album.id}`}
                  src={`https://picsum.photos/seed/album-${album.id}/800/420`}
                  className="card-media"
                />
                <IonCardHeader>
                  <IonCardTitle className="card-title">{album.title}</IonCardTitle>
                  <IonCardSubtitle className="card-subtitle">
                    <IonIcon icon={albumsOutline} /> Album #{album.id}
                  </IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonChip color="tertiary">
                    <IonIcon icon={personOutline} />
                    <IonLabel>User ID: {album.userId}</IonLabel>
                  </IonChip>
                  <IonChip color="medium">
                    <IonLabel>Tap to view owner details</IonLabel>
                  </IonChip>
                </IonCardContent>
              </IonCard>
            </IonCol>
          ))}
        </IonRow>
      </IonGrid>

      <IonModal
        isOpen={isSheetOpen && selectedAlbum !== null}
        onDidDismiss={closeAlbumSheet}
        className="sheet-modal"
        initialBreakpoint={1}
        breakpoints={[0, 0.72, 1]}
      >
        {selectedAlbum && (
          <IonCard className="sheet-card">
            <img
              alt={`Album ${selectedAlbum.id}`}
              src={`https://picsum.photos/seed/album-${selectedAlbum.id}/1000/600`}
              className="card-media"
            />
            <IonCardHeader>
              <IonCardTitle className="card-title">{selectedAlbum.title}</IonCardTitle>
              <IonCardSubtitle className="card-subtitle">
                <IonIcon icon={albumsOutline} /> Album #{selectedAlbum.id}
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p style={{ marginTop: 0 }}>
                  Owner: {selectedAlbumUser ? selectedAlbumUser.name : albumUserError ? 'Unable to load' : 'Loading…'}
                </p>
              </IonText>
              {selectedAlbumUser && (
                <IonChip color="tertiary">
                  <IonIcon icon={personOutline} />
                  <IonLabel>@{selectedAlbumUser.username}</IonLabel>
                </IonChip>
              )}
              {albumUserError && (
                <IonItem color="danger" lines="none">
                  <IonLabel>{albumUserError}</IonLabel>
                </IonItem>
              )}

              <div className="sheet-actions">
                <IonButton expand="block" className="btn-primary" onClick={goToUserDetails} disabled={!selectedAlbum}>
                  View owner profile
                </IonButton>
                <IonButton expand="block" fill="clear" className="btn-ghost" onClick={closeAlbumSheet}>
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

export default AlbumsSection;
