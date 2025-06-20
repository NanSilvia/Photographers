import { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import Button from "@mui/joy/Button";
import SvgIcon from "@mui/joy/SvgIcon";
import { styled } from "@mui/joy";
import { uploadFile } from "../api";
import Photo from "../model/Photo";
import { ReactPhotoEditor } from "react-photo-editor";
import TagEditor from "../components/TagEditor";

interface PhotoFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Omit<Photo, "id">, "photographer">) => void;
  defaultValues: Photo | null;
}

function PhotoForm({ open, onClose, onSubmit, defaultValues }: PhotoFormProps) {
  const { control, handleSubmit, reset } = useForm<Omit<Photo, "id">>({
    defaultValues: {
      title: "",
      description: "",
      ...defaultValues, // pune valorile de dinainte
    },
  });

  const [file, setFile] = useState<File | undefined>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [filePath, setFilePath] = useState<string>("");
  const hideModal = () => {
    setShowModal(false);
  };
  const handleSaveImage = (editedFile: File) => {
    uploadFile(editedFile)
      .then((response) => {
        setFilePath(`${response.fileId}`);
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
        // Handle error appropriately, maybe set an error state
      });
  };

  const setFileData = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target?.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // de fiecare data cand default values se schimba, se trigaruieste
  // useEffect(() => {
  //     if (defaultValues) {
  //         reset(defaultValues);
  //     }
  // }, [defaultValues, reset]);

  //ptr ca la aia de add a new sa nu fetchuiasca valorile de la ultimul potograf editat
  useEffect(() => {
    if (open) {
      reset(
        defaultValues || {
          title: "",
          description: "",
        }
      );
    }
  }, [open, defaultValues, reset]);

  const handleFormSubmit = (data: Omit<Omit<Photo, "id">, "photographer">) => {
    data.imageUrl = filePath;
    onSubmit(data);
    reset();
    onClose();
  };
  const VisuallyHiddenInput = styled("input")`
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    bottom: 0;
    left: 0;
    white-space: nowrap;
    width: 1px;
  `;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {defaultValues ? "Edit Photo" : "Add New Photo"}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                fullWidth
                margin="normal"
                required
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                required
              />
            )}
          />
          {/* File Upload */}
          <Controller
            name="imageUrl"
            control={control}
            render={({ field }) => (
              <Button
                component="label"
                role={undefined}
                tabIndex={-1}
                variant="outlined"
                startDecorator={
                  <SvgIcon>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                      />
                    </svg>
                  </SvgIcon>
                }
              >
                Upload a file
                <VisuallyHiddenInput
                  type="file"
                  onChange={(e: InputEvent) => {
                    if (e.target instanceof HTMLInputElement) {
                      const file = e.target.files?.[0];
                      if (file) {
                        field.onChange(file);
                        setFile(file);
                        setShowModal(true);
                      }
                    }
                  }}
                />
              </Button>
            )}
          />
          {file && (
            <ReactPhotoEditor
              open={showModal}
              onClose={hideModal}
              file={file}
              onSaveImage={handleSaveImage}
              downloadOnSave={false}
            />
          )}
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagEditor
                tags={field.value || []}
                onChange={(tags) => field.onChange(tags)}
              />
            )}
          />
          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" color="primary">
              Save
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PhotoForm;
