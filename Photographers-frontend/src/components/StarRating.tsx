import React from "react";
import { Box, IconButton } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <IconButton
          key={star}
          onClick={() => onChange && onChange(star)}
          disabled={disabled}
          size="small"
          sx={{ color: star <= value ? "#FFD700" : undefined }}
        >
          {star <= value ? <StarIcon /> : <StarBorderIcon />}
        </IconButton>
      ))}
    </Box>
  );
};

export default StarRating;
