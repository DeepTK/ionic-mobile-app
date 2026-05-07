import { useEffect, useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonModal,
  IonItem,
  IonLabel,
  IonRow,
  IonSkeletonText,
  IonText,
} from '@ionic/react';
import { fetchPosts, type Post } from '../services/posts';

const PostsSection: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchPosts(8);
      setPosts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPosts();
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
                <IonCardHeader>
                  <IonCardTitle className="card-title">
                    <IonSkeletonText animated style={{ width: '90%' }} />
                  </IonCardTitle>
                  <IonCardSubtitle className="card-subtitle">
                    <IonSkeletonText animated style={{ width: '40%' }} />
                  </IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonSkeletonText animated style={{ width: '100%' }} />
                  <IonSkeletonText animated style={{ width: '92%' }} />
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
        <IonButton slot="end" fill="clear" className="btn-inline" onClick={() => void loadPosts()}>
          Retry
        </IonButton>
      </IonItem>
    );
  }

  const openPostSheet = (post: Post) => {
    setSelectedPost(post);
    setIsSheetOpen(true);
  };

  const closePostSheet = () => {
    setIsSheetOpen(false);
    setSelectedPost(null);
  };

  return (
    <>
      <IonGrid fixed className="content-grid">
        <IonRow className="cards-row">
          {posts.map((post) => (
            <IonCol
              key={post.id}
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
                onClick={() => openPostSheet(post)}
              >
                <IonCardHeader>
                  <IonCardTitle className="card-title">{post.title}</IonCardTitle>
                  <IonCardSubtitle className="card-subtitle">Post #{post.id}</IonCardSubtitle>
                </IonCardHeader>

                <IonCardContent>
                  <p className="card-excerpt">{post.body}</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
          ))}
        </IonRow>
      </IonGrid>

      <IonModal
        isOpen={isSheetOpen && selectedPost !== null}
        onDidDismiss={closePostSheet}
        className="sheet-modal"
        initialBreakpoint={1}
        breakpoints={[0, 0.72, 1]}
      >
        {selectedPost && (
          <IonCard className="sheet-card">
            <IonCardHeader>
              <IonCardTitle className="card-title">{selectedPost.title}</IonCardTitle>
              <IonCardSubtitle className="card-subtitle">Post #{selectedPost.id}</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p style={{ marginTop: 0 }}>{selectedPost.body}</p>
              </IonText>
              <div className="sheet-actions">
                <IonButton expand="block" fill="clear" className="btn-ghost" onClick={closePostSheet}>
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

export default PostsSection;
