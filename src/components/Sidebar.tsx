import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  albumsOutline,
  cameraOutline,
  documentTextOutline,
  imagesOutline,
  moonOutline,
  notificationsOutline,
  peopleOutline,
  sunnyOutline,
  trashOutline,
} from "ionicons/icons";

const menuItems = [
  { label: "Post", route: "/post", icon: documentTextOutline },
  { label: "Users", route: "/users", icon: peopleOutline },
  { label: "Albums", route: "/albums", icon: albumsOutline },
];
const CAMERA_STORAGE_KEY = "camera-captured-images";
const MAX_SAVED_IMAGES = 8;

type SidebarProps = {
  isDark: boolean;
  onToggleTheme: (checked: boolean) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isDark, onToggleTheme }) => {
  const location = useLocation();
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  const isActiveRoute = (route: string) =>
    route === "/users" ? location.pathname === "/users" || location.pathname.startsWith("/users/") : location.pathname === route;

  useEffect(() => {
    const rawImages = localStorage.getItem(CAMERA_STORAGE_KEY);
    if (!rawImages) {
      return;
    }
    try {
      const parsed = JSON.parse(rawImages) as string[];
      if (Array.isArray(parsed)) {
        setCapturedImages(parsed.filter((item) => typeof item === "string"));
      }
    } catch {
      localStorage.removeItem(CAMERA_STORAGE_KEY);
    }
  }, []);

  const persistImages = (images: string[]) => {
    setCapturedImages(images);
    localStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify(images));
  };

  const capturePhoto = async () => {
    setCameraError(null);
    try {
      const photo = await Camera.getPhoto({
        quality: 88,
        source: CameraSource.Prompt,
        resultType: CameraResultType.DataUrl,
      });
      if (!photo.dataUrl) {
        setCameraError("Photo capture was cancelled.");
        return;
      }
      const updatedImages = [photo.dataUrl, ...capturedImages].slice(0, MAX_SAVED_IMAGES);
      persistImages(updatedImages);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to open camera.";
      setCameraError(message);
    }
  };

  const clearSavedPhotos = () => {
    setCameraError(null);
    localStorage.removeItem(CAMERA_STORAGE_KEY);
    setCapturedImages([]);
  };

  const triggerNotification = async () => {
    setNotificationError(null);
    try {
      const permStatus = await LocalNotifications.checkPermissions();
      const displayPermission =
        permStatus.display === "granted"
          ? permStatus
          : await LocalNotifications.requestPermissions();

      if (displayPermission.display !== "granted") {
        setNotificationError("Notification permission is required.");
        return;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now() % 2147483647,
            title: "Hello Deepak!",
            body: "Your in-app notification button is working.",
            schedule: { at: new Date(Date.now() + 500) },
          },
        ],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to show notification.";
      setNotificationError(message);
    }
  };

  return (
    <IonMenu menuId="main-menu" contentId="main-content" type="overlay">
      <IonHeader className="sidebar-header">
        <IonToolbar className="sidebar-toolbar">
          <IonTitle className="sidebar-title">Circle</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonList inset className="sidebar-section sidebar-profile">
          <IonItem lines="none">
            <IonAvatar slot="start">
              <img src="https://i.pravatar.cc/120?img=12" alt="Profile" />
            </IonAvatar>
            <IonLabel className="sidebar-profile-text">
              <h2 className="sidebar-profile-name">Deepak</h2>
              <p className="sidebar-profile-tagline">Designing delightful mobile experiences</p>
            </IonLabel>
            <IonBadge color="success" slot="end" className="sidebar-badge">
              Pro
            </IonBadge>
          </IonItem>
        </IonList>

        <IonList inset className="sidebar-section">
          <IonListHeader>
            <IonLabel>Navigation</IonLabel>
          </IonListHeader>
          {menuItems.map((item) => (
            <IonMenuToggle key={item.route} autoHide={true}>
              <IonItem
                button
                routerLink={item.route}
                routerDirection="none"
                detail={true}
                className={isActiveRoute(item.route) ? "sidebar-active-item" : undefined}
                aria-current={isActiveRoute(item.route) ? "page" : undefined}
              >
                <IonIcon aria-hidden="true" icon={item.icon} slot="start" />
                <IonLabel>{item.label}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>

        <IonList inset className="sidebar-section">
          <IonListHeader>
            <IonLabel>Appearance</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonIcon
              icon={isDark ? moonOutline : sunnyOutline}
              slot="start"
              color={isDark ? "medium" : "warning"}
            />
            <IonLabel>
              <h2>Dark Mode</h2>
              <p className="sidebar-helper">Theme preference is saved automatically.</p>
            </IonLabel>
            <IonToggle
              slot="end"
              checked={isDark}
              aria-label="Toggle dark mode"
              onIonChange={(event) => onToggleTheme(event.detail.checked)}
            />
          </IonItem>
        </IonList>

        <IonList inset className="sidebar-section">
          <IonListHeader>
            <IonLabel>Camera</IonLabel>
          </IonListHeader>
          <IonItem lines="none">
            <IonIcon icon={cameraOutline} slot="start" />
            <IonLabel>
              <h2>Capture photo</h2>
              <p className="sidebar-helper">Open camera and save images on this device.</p>
            </IonLabel>
          </IonItem>
          <IonItem lines="none" className="sidebar-camera-actions">
            <IonButton expand="block" className="btn-primary" onClick={() => void capturePhoto()}>
              Take Photo
            </IonButton>
            {capturedImages.length > 0 && (
              <IonButton
                expand="block"
                fill="clear"
                className="btn-ghost"
                onClick={clearSavedPhotos}
              >
                <IonIcon icon={trashOutline} slot="start" />
                Clear Saved Photos
              </IonButton>
            )}
          </IonItem>
          {cameraError && (
            <IonItem lines="none">
              <IonNote color="danger">{cameraError}</IonNote>
            </IonItem>
          )}
          {capturedImages.length > 0 && (
            <IonItem lines="none" className="sidebar-camera-gallery">
              <IonIcon icon={imagesOutline} slot="start" />
              <IonLabel>
                <h2>Saved photos ({capturedImages.length})</h2>
                <div className="sidebar-camera-grid">
                  {capturedImages.map((image, index) => (
                    <img
                      key={`${index}-${image.slice(0, 18)}`}
                      src={image}
                      alt={`Captured ${index + 1}`}
                      className="sidebar-camera-thumb"
                    />
                  ))}
                </div>
              </IonLabel>
            </IonItem>
          )}
        </IonList>

        <IonList inset className="sidebar-section">
          <IonListHeader>
            <IonLabel>Notifications</IonLabel>
          </IonListHeader>
          <IonItem lines="none">
            <IonIcon icon={notificationsOutline} slot="start" />
            <IonLabel>
              <h2>Test local notification</h2>
              <p className="sidebar-helper">Tap button to trigger a notification popup.</p>
            </IonLabel>
          </IonItem>
          <IonItem lines="none" className="sidebar-camera-actions">
            <IonButton expand="block" className="btn-primary" onClick={() => void triggerNotification()}>
              Show Notification
            </IonButton>
          </IonItem>
          {notificationError && (
            <IonItem lines="none">
              <IonNote color="danger">{notificationError}</IonNote>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Sidebar;
