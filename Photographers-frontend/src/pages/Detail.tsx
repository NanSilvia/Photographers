import { Button, Card, CardActions, Grid, Grid2, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Photographer from "../model/Photographer";
import "../styles/TextFieldStyle.css";

import PhotographersApi from "../service/PhotographersApi";
import usePhotoStore from "../stores/PhotoStore";
import Photo from "../model/Photo";
import PhotoForm from "./PhotoForm";
import { API_URL } from "../api";
import { Delete, Edit } from "@mui/icons-material";
import ConfirmationDialog from "./ModalPopup";

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
  const { photos, setPhotographer: setPhotoStorePhotographer, addPhoto, updatePhoto, deletePhoto } = usePhotoStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

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


  const handleAddPhoto = async (photo: Omit<Omit<Photo, 'id'>, 'photographer'>) => {
    addPhoto(photo);
  }
  const handleUpdatePhoto = async (photo: Omit<Omit<Photo, 'id'>, 'photographer'>) => {
    if (!p) return;
    updatePhoto({
      ...photo,
      id: selectedPhoto!.id,
      photographer: p,
    });
  }
  const handleDeletePhoto = async (photoId: number) => {
    deletePhoto(photoId);
  }


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
        onSubmit={
          selectedPhoto ? handleUpdatePhoto : handleAddPhoto
        }
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
                <a
                  href={`${API_URL}/file/${p.videoId}`}
                  target="_blank"
                >
                  Download video
                </a>
              </Grid>
            )}


          </Grid>

        </Grid>
      </Grid>

      {/* Add Photo Button */}
      <Grid item xs={12} sx={{ marginTop: 2 }}>
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
      </Grid>

      {/* lista de fotografii */}
      <Grid2>
        {
          photos.map((photo) => {
            return <Card
              key={photo.id}
              sx={{
                width: "100%",
                height: "auto",
                marginTop: 2,
                padding: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <img
                src={`${API_URL}/file/${photo.imageUrl}`}
                alt={photo.title}
                style={{ width: "100%", height: "auto", borderRadius: "8px" }}
              />
              <Typography variant="h6" color="black" sx={{ marginTop: 1 }}>
                {photo.title}
              </Typography>
              <Typography variant="body2" color="black" sx={{ marginTop: 1 }}>
                {photo.description}
              </Typography>
              <CardActions>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(photo);
                    setIsFormOpen(true);
                  }}
                >
                  <Edit />
                </IconButton>
                <ConfirmationDialog
                  title="Delete Photographer"
                  description="Are you sure you want to delete this photographer?"
                  response={() => handleDeletePhoto(photo.id)}
                >
                  {(onClick) => (
                    <IconButton onClick={(e) => {
                      e.stopPropagation();
                      onClick();
                    }}>
                      <Delete />
                    </IconButton>
                  )}
                </ConfirmationDialog>
              </CardActions>
            </Card>;
          }
          )
        }
      </Grid2>
    </>
  );
};

export default Detail;
