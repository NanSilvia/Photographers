import { Card, CardActions, IconButton, Typography } from "@mui/material";
import TagList from "./TagList";
import { API_URL } from "../api";
import { Delete, Edit } from "@mui/icons-material";
import ConfirmationDialog from "../pages/ModalPopup";
import Photo from "../model/Photo";

export interface PhotoCardProps {
  photo: Photo;
  setSelectedPhoto?: (photo: Photo | null) => void;
  setIsFormOpen?: (isOpen: boolean) => void;
  handleDeletePhoto?: (photoId: number) => void;
}

export const PhotoCard = ({
  photo,
  setSelectedPhoto,
  setIsFormOpen,
  handleDeletePhoto,
}: PhotoCardProps) => {
  return (
    <Card
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
      <TagList tags={photo.tags} />
      <CardActions>
        {setSelectedPhoto && setIsFormOpen && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto(photo);
              setIsFormOpen(true);
            }}
          >
            <Edit />
          </IconButton>
        )}
        {handleDeletePhoto && (
          <ConfirmationDialog
            title="Delete Photographer"
            description="Are you sure you want to delete this photographer?"
            response={() => handleDeletePhoto(photo.id)}
          >
            {(onClick) => (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Delete />
              </IconButton>
            )}
          </ConfirmationDialog>
        )}
      </CardActions>
    </Card>
  );
};
