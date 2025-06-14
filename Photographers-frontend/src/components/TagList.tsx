import { Tag } from "@mui/icons-material";
import { Chip, Stack } from "@mui/material";

export default function TagList({ tags }: { tags: string[] }) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
      {tags.map((tag, index) => (
        <Chip
          key={index}
          label={<>#{tag}</>}
          component="a"
          href={`/tags/${tag}`}
          clickable
          variant="outlined"
          color="primary"
        />
      ))}
    </Stack>
  );
}
