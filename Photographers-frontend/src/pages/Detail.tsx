import { Button, Grid, Typography, Box, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Photographer from "../model/Photographer";
import Album from "../model/Album";
import "../styles/TextFieldStyle.css";

import PhotographersApi from "../service/PhotographersApi";
import AlbumsApi from "../service/AlbumsApi";
import usePhotoStore from "../stores/PhotoStore";
import Photo from "../model/Photo";
import PhotoForm from "./PhotoForm";
import { API_URL } from "../api";
import { PhotoCard } from "../components/PhotoCard";
import AlbumsList from "../components/AlbumsList";
import AddAlbumDialog from "../components/AddAlbumDialog";
import AddPhotoToAlbumDialog from "../components/AddPhotoToAlbumDialog";

const Detail = () => {
  //const params = useParams();
  //const [p, setPhotographer] = useState<Photographer | undefined>(undefined);
  //const { photographers, fetchPhotographers } = usePhotographerStore();

  // useEffect(() => {
  //     const loadPhotographer = async () => {
  //         if (photographers.length === 0) {
  //             await fetchPhotographers();
  //         }

  //         if (params.id) {
  //             const foundPhotographer = photographers.find((p) => p.id === parseInt(params.id!));
  //             setPhotographer(foundPhotographer);
  //         }
  //     };

  //     loadPhotographer();
  // }, [params.id, photographers, fetchPhotographers]);

  // if (!p) {
  //     return <Typography variant="h4" color="whitesmoke">Photographer not found</Typography>;
  // }

  const params = useParams();
  const [p, setPhotographer] = useState<Photographer | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    photos,
    setPhotographer: setPhotoStorePhotographer,
    addPhoto,
    updatePhoto,
    deletePhoto,
  } = usePhotoStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Album state
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [isAddAlbumDialogOpen, setIsAddAlbumDialogOpen] = useState(false);
  const [isAddPhotoToAlbumDialogOpen, setIsAddPhotoToAlbumDialogOpen] =
    useState(false);
  const [selectedPhotoForAlbum, setSelectedPhotoForAlbum] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [albumOperationLoading, setAlbumOperationLoading] = useState(false);

  useEffect(() => {
    const loadPhotographer = async () => {
      try {
        setLoading(true);
        if (params.id) {
          const photographer = await PhotographersApi.getById(
            parseInt(params.id)
          );
          if (photographer) {
            setPhotographer(photographer);
            setPhotoStorePhotographer(photographer.id);
            // Load albums for this photographer
            loadAlbums(photographer.id);
          } else {
            setError("Photographer not found");
          }
        }
      } catch (err) {
        setError("Failed to load photographer");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPhotographer();
  }, [params.id]);

  const loadAlbums = async (photographerId: number) => {
    try {
      setAlbumsLoading(true);
      const albumsData = await AlbumsApi.getAlbumsForPhotographer(
        photographerId
      );
      setAlbums(albumsData);
    } catch (err) {
      console.error("Failed to load albums:", err);
    } finally {
      setAlbumsLoading(false);
    }
  };

  const handleAddPhoto = async (
    photo: Omit<Omit<Photo, "id">, "photographer">
  ) => {
    addPhoto(photo);
  };
  const handleUpdatePhoto = async (
    photo: Omit<Omit<Photo, "id">, "photographer">
  ) => {
    if (!p) return;
    updatePhoto({
      ...photo,
      id: selectedPhoto!.id,
      photographer: p,
    });
  };
  const handleDeletePhoto = async (photoId: number) => {
    deletePhoto(photoId);
  };
  const handleCreateAlbum = async (name: string) => {
    if (!p) return;

    try {
      setAlbumOperationLoading(true);
      await AlbumsApi.createAlbum(p.id, name);
      // Reload albums
      await loadAlbums(p.id);
    } catch (err) {
      console.error("Failed to create album:", err);
    } finally {
      setAlbumOperationLoading(false);
    }
  };

  const handleAddPhotoToAlbum = (photoId: number, photoTitle: string) => {
    setSelectedPhotoForAlbum({ id: photoId, title: photoTitle });
    setIsAddPhotoToAlbumDialogOpen(true);
  };

  const handleSubmitAddPhotoToAlbum = async (albumId: number) => {
    if (!selectedPhotoForAlbum) return;

    try {
      setAlbumOperationLoading(true);
      await AlbumsApi.addPhotoToAlbum(albumId, selectedPhotoForAlbum.id);
      // Reload albums to reflect the change
      if (p) await loadAlbums(p.id);
    } catch (err) {
      console.error("Failed to add photo to album:", err);
    } finally {
      setAlbumOperationLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!p) return <div>Photographer not found</div>;

  return (
    <>
      <PhotoForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedPhoto(null);
        }}
        onSubmit={selectedPhoto ? handleUpdatePhoto : handleAddPhoto}
        defaultValues={selectedPhoto}
      />

      <Grid container spacing={4} sx={{ padding: 4 }}>
        {/* Left Side: Photo */}
        <Grid item xs={12} md={6}>
          <img
            src={p.profilepicUrl}
            alt={p.name}
            style={{ width: "100%", height: "auto", borderRadius: "8px" }}
          />
        </Grid>

        {/* Right Side: Details */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            {/* Name */}
            <Grid item xs={12}>
              <Typography variant="h3" color="black">
                {p.name}
              </Typography>
            </Grid>

            {/* Birth Date - Death Date */}
            <Grid item xs={12}>
              <Typography variant="h5" color="black">
                {`Born: ${p.birth.toLocaleDateString()}`}
              </Typography>
              {p.death && (
                <Typography variant="h5" color="black">
                  {`Died: ${p.death.toLocaleDateString()}`}
                </Typography>
              )}
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Typography variant="body1" color="black" sx={{ marginTop: 2 }}>
                {p.description}
              </Typography>
            </Grid>

            {/* Video if videoId is not undefined */}
            {p.videoId && (
              <Grid item xs={12} sx={{ marginTop: 2 }}>
                <video
                  width="100%"
                  height="315"
                  src={`${API_URL}/file/${p.videoId}`}
                  title="video player"
                  controls
                />
                <a href={`${API_URL}/file/${p.videoId}`} target="_blank">
                  Download video
                </a>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>

      {/* Add Photo and Album Buttons */}
      <Box sx={{ display: "flex", gap: 2, marginTop: 2, marginBottom: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setSelectedPhoto(null);
            setIsFormOpen(true);
          }}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#115293",
            },
          }}
        >
          Add Photo
        </Button>
        <Button
          variant="outlined"
          onClick={() => setIsAddAlbumDialogOpen(true)}
        >
          Create Album
        </Button>
      </Box>

      {/* Albums Section */}
      <AlbumsList albums={albums} loading={albumsLoading} />

      <Divider sx={{ my: 4 }} />

      {/* Photos Section */}
      <Typography variant="h4" color="black" sx={{ marginBottom: 2 }}>
        Photos ({photos.length})
      </Typography>

      {/* Photos Grid - 4 columns */}
      <Grid container spacing={3}>
        {photos.map((photo) => (
          <Grid item xs={12} sm={6} md={3} key={photo.id}>
            <PhotoCard
              photo={photo}
              setSelectedPhoto={setSelectedPhoto}
              setIsFormOpen={setIsFormOpen}
              handleDeletePhoto={handleDeletePhoto}
              onAddToAlbum={handleAddPhotoToAlbum}
            />
          </Grid>
        ))}
      </Grid>

      {/* Album Dialogs */}
      <AddAlbumDialog
        open={isAddAlbumDialogOpen}
        onClose={() => setIsAddAlbumDialogOpen(false)}
        onSubmit={handleCreateAlbum}
        loading={albumOperationLoading}
      />

      <AddPhotoToAlbumDialog
        open={isAddPhotoToAlbumDialogOpen}
        onClose={() => {
          setIsAddPhotoToAlbumDialogOpen(false);
          setSelectedPhotoForAlbum(null);
        }}
        onSubmit={handleSubmitAddPhotoToAlbum}
        albums={albums}
        photoTitle={selectedPhotoForAlbum?.title}
        loading={albumOperationLoading}
      />
    </>
  );
};

export default Detail;
