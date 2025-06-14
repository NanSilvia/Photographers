import { useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import Photographer from "../model/Photographer";
import Button from "@mui/joy/Button";
import SvgIcon from "@mui/joy/SvgIcon";
import { styled } from "@mui/joy";
import { uploadFile } from "../api";

interface PhotographerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Photographer, "id">) => void;
  defaultValues?: Omit<Photographer, "id">;
}

function PhotographerForm({
  open,
  onClose,
  onSubmit,
  defaultValues,
}: PhotographerFormProps) {
  const { control, handleSubmit, reset } = useForm<Omit<Photographer, "id">>({
    defaultValues: {
      name: "",
      birth: new Date(),
      death: null,
      profilepicUrl: "",
      description: "",
      ...defaultValues, // pune valorile de dinainte
    },
  });

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
          name: "",
          birth: new Date(),
          death: null,
          profilepicUrl: "",
          description: "",
        }
      );
    }
  }, [open, defaultValues, reset]);

  const handleFormSubmit = (data: Omit<Photographer, "id">) => {
    const formattedData = {
      ...data,
      birth: new Date(data.birth),
      death: data.death ? new Date(data.death) : null,
    };
    onSubmit(formattedData);
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
        {defaultValues ? "Edit Photographer" : "Add New Photographer"}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                margin="normal"
                required
              />
            )}
          />
          <Controller
            name="birth"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Birth Date"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={
                  field.value
                    ? new Date(field.value).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => field.onChange(new Date(e.target.value))}
                required
              />
            )}
          />
          <Controller
            name="death"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Death Date"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={
                  field.value
                    ? new Date(field.value).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
              />
            )}
          />
          <Controller
            name="profilepicUrl"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Profile Picture URL"
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
            name="videoId"
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
                    if(e.target instanceof HTMLInputElement) {
                      const file = e.target.files?.[0];
                      if (file) {
                        field.onChange(file);
                        uploadFile(file)
                          .then((response) => {
                            // Assuming the server returns { fileId: 'unique-id' }
                            console.log(
                              "File uploaded successfully:",
                              response.fileId
                            );
                            field.onChange(response.fileId); // Update the form field with the fileId
                          })
                          .catch((error) => {
                            console.error("Error uploading file:", error);
                            // Handle error appropriately, maybe set an error state
                          });
                      }
                    }
                  }}
                />
              </Button>
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

export default PhotographerForm;
