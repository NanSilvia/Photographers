import { Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Photographer from "../model/Photographer";
import "../styles/TextFieldStyle.css";

import usePhotographerStore from "../stores/PhotographerStore";
import PhotographersApi from "../service/PhotographersApi";

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!p) return <div>Photographer not found</div>;

  return (
    <>
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
                  src={`http://localhost:5000/file/${p.videoId}`}
                  title="video player"
                  controls
                />
                <a
                  href={`http://localhost:5000/file/${p.videoId}`}
                  target="_blank"
                >
                  Download video
                </a>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Detail;
