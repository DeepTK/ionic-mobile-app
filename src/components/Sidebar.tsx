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
  IonModal,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { Capacitor } from "@capacitor/core";
import { Camera } from "@capacitor/camera";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useEffect, useRef, useState } from "react";
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
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const webCameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const webCameraCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webCameraStreamRef = useRef<MediaStream | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [isWebCameraOpen, setIsWebCameraOpen] = useState(false);

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

  useEffect(() => {
    return () => {
      if (webCameraStreamRef.current) {
        webCameraStreamRef.current.getTracks().forEach((track) => track.stop());
        webCameraStreamRef.current = null;
      }
    };
  }, []);

  const persistImages = (images: string[]) => {
    setCapturedImages(images);
    localStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify(images));
  };

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }
        reject(new Error("Unable to read image data."));
      };
      reader.onerror = () => reject(new Error("Unable to process captured image."));
      reader.readAsDataURL(blob);
    });

  const capturePhoto = async () => {
    setCameraError(null);
    try {
      if (!Capacitor.isNativePlatform()) {
        if (!navigator.mediaDevices?.getUserMedia) {
          setCameraError("Camera access is not supported in this browser.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        webCameraStreamRef.current = stream;
        setIsWebCameraOpen(true);
        return;
      }

      const cameraPermStatus = await Camera.checkPermissions();
      const cameraPermission =
        cameraPermStatus.camera === "granted"
          ? cameraPermStatus
          : await Camera.requestPermissions({ permissions: ["camera"] });

      if (cameraPermission.camera !== "granted") {
        setCameraError("Camera permission is required to take a photo.");
        return;
      }

      const photo = await Camera.takePhoto({
        quality: 100,
      });

      let imageDataUrl: string | null = null;
      if (photo.webPath) {
        const imageResponse = await fetch(photo.webPath);
        const imageBlob = await imageResponse.blob();
        imageDataUrl = await blobToDataUrl(imageBlob);
      } else if (photo.thumbnail) {
        imageDataUrl = `data:image/jpeg;base64,${photo.thumbnail}`;
      }

      if (!imageDataUrl) {
        setCameraError("Photo capture was cancelled.");
        return;
      }

      const updatedImages = [imageDataUrl, ...capturedImages].slice(0, MAX_SAVED_IMAGES);
      persistImages(updatedImages);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to open camera.";
      setCameraError(message);
    }
  };

  const closeWebCamera = () => {
    if (webCameraStreamRef.current) {
      webCameraStreamRef.current.getTracks().forEach((track) => track.stop());
      webCameraStreamRef.current = null;
    }
    if (webCameraVideoRef.current) {
      webCameraVideoRef.current.srcObject = null;
    }
    setIsWebCameraOpen(false);
  };

  const handleWebCameraModalDidPresent = async () => {
    if (!webCameraVideoRef.current || !webCameraStreamRef.current) {
      return;
    }
    webCameraVideoRef.current.srcObject = webCameraStreamRef.current;
    try {
      await webCameraVideoRef.current.play();
    } catch {
      setCameraError("Unable to start camera preview.");
      closeWebCamera();
    }
  };

  const captureFromWebCamera = () => {
    const videoEl = webCameraVideoRef.current;
    const canvasEl = webCameraCanvasRef.current;
    if (!videoEl || !canvasEl || videoEl.videoWidth === 0 || videoEl.videoHeight === 0) {
      setCameraError("Camera preview is not ready yet.");
      return;
    }

    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    const context = canvasEl.getContext("2d");
    if (!context) {
      setCameraError("Unable to capture image.");
      return;
    }

    context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    const imageDataUrl = canvasEl.toDataURL("image/jpeg", 0.9);
    const updatedImages = [imageDataUrl, ...capturedImages].slice(0, MAX_SAVED_IMAGES);
    persistImages(updatedImages);
    closeWebCamera();
  };

  const chooseFromGallery = async () => {
    setCameraError(null);
    try {
      if (!Capacitor.isNativePlatform()) {
        galleryInputRef.current?.click();
        return;
      }

      const photoPermStatus = await Camera.checkPermissions();
      const photoPermission =
        photoPermStatus.photos === "granted" || photoPermStatus.photos === "limited"
          ? photoPermStatus
          : await Camera.requestPermissions({ permissions: ["photos"] });

      if (photoPermission.photos !== "granted" && photoPermission.photos !== "limited") {
        setCameraError("Gallery permission is required to choose photos.");
        return;
      }

      const galleryResult = await Camera.chooseFromGallery({
        mediaType: 0,
        allowMultipleSelection: false,
        quality: 100,
      });

      const pickedPhoto = galleryResult.results.find((result) => Boolean(result.webPath || result.thumbnail));
      if (!pickedPhoto) {
        setCameraError("No image was selected.");
        return;
      }

      let imageDataUrl: string | null = null;
      if (pickedPhoto.webPath) {
        const imageResponse = await fetch(pickedPhoto.webPath);
        const imageBlob = await imageResponse.blob();
        imageDataUrl = await blobToDataUrl(imageBlob);
      } else if (pickedPhoto.thumbnail) {
        imageDataUrl = `data:image/jpeg;base64,${pickedPhoto.thumbnail}`;
      }

      if (!imageDataUrl) {
        setCameraError("No image data found for selected photo.");
        return;
      }

      const updatedImages = [imageDataUrl, ...capturedImages].slice(0, MAX_SAVED_IMAGES);
      persistImages(updatedImages);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to open gallery.";
      setCameraError(message);
    }
  };

  const handleWebGalleryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";
    if (!selectedFile) {
      return;
    }

    setCameraError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== "string") {
        setCameraError("Unable to process selected image.");
        return;
      }
      const updatedImages = [reader.result, ...capturedImages].slice(0, MAX_SAVED_IMAGES);
      persistImages(updatedImages);
    };
    reader.onerror = () => {
      setCameraError("Unable to read selected image.");
    };
    reader.readAsDataURL(selectedFile);
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
            <IonButton expand="block" fill="outline" className="btn-secondary" onClick={() => void chooseFromGallery()}>
              Choose From Gallery
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
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleWebGalleryChange}
        />
        <IonModal isOpen={isWebCameraOpen} onDidPresent={handleWebCameraModalDidPresent} onDidDismiss={closeWebCamera}>
          <div className="web-camera-modal">
            <h2>Take Photo</h2>
            <video ref={webCameraVideoRef} className="web-camera-preview" autoPlay playsInline muted />
            <canvas ref={webCameraCanvasRef} hidden />
            <div className="web-camera-actions">
              <IonButton className="btn-primary" onClick={captureFromWebCamera}>
                Capture
              </IonButton>
              <IonButton fill="clear" className="btn-ghost" onClick={closeWebCamera}>
                Cancel
              </IonButton>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonMenu>
  );
};

export default Sidebar;
