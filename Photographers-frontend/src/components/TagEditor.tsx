import { Button, Chip, Stack, TextField } from "@mui/material";
import { useState } from "react";

export default function TagEditor({
    tags,
    onChange,
    }: {
    tags: string[];
    onChange: (tags: string[]) => void;
    }) {
    const [newTag, setNewTag] = useState("");
    
    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
        onChange([...tags, newTag.trim()]);
        setNewTag("");
        }
    };
    
    const handleDeleteTag = (tagToDelete: string) => {
        onChange(tags.filter((tag) => tag !== tagToDelete));
    };
    
    return (
        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
        {tags.map((tag, index) => (
            <Chip
            key={index}
            label={tag}
            onDelete={() => handleDeleteTag(tag)}
            variant="outlined"
            color="primary"
            />
        ))}
        <TextField
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            size="small"
            variant="outlined"
            sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" color="primary" onClick={handleAddTag}>
            Add
        </Button>
        </Stack>
    );
};