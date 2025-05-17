// not used?

import {
    Button,
    Dialog,
    Grid,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import usePhotographerStore from '../stores/PhotographerStore';

interface Inputs {
    // Photographer fields
    name: string;
    birth: string; // Date as string for input field compatibility
    death: string | null; // Date as string for input field compatibility
    age: number;
    profilepicUrl: string;
    description: string;
}

const PhotographerDialog = () => {
    const { opened, handleClose, addPhotographer, selectedPhotographer, editPhotographer } =
        usePhotographerStore();

    const { register, handleSubmit, reset } = useForm<Inputs>();

    // Reset the form when selectedPhotographer changes
    useEffect(() => {
        if (opened) {
            // Convert Date objects to strings for the input fields
            reset({
                ...selectedPhotographer,
                birth: selectedPhotographer?.birth ? selectedPhotographer.birth.toISOString().split('T')[0] : '',
                death: selectedPhotographer?.death ? selectedPhotographer.death.toISOString().split('T')[0] : null,
            });
        }
    }, [selectedPhotographer, opened, reset]);

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        // Convert strings back to Date objects
        const photographerData = {
            ...data,
            birth: new Date(data.birth),
            death: data.death ? new Date(data.death) : null,
        };

        if (selectedPhotographer && selectedPhotographer.id) {
            // Edit existing photographer
            editPhotographer({
                ...selectedPhotographer,
                ...photographerData,
            });
        } else {
            // Add new photographer
            addPhotographer({
                ...photographerData,
            });
        }
        reset();
        handleClose();
    };

    return (
        <Dialog
            open={opened}
            onClose={handleClose}
            fullWidth
            maxWidth='sm'
            fullScreen={false}
        >
            <form style={{ padding: 16 }} onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant='h5'>
                            {selectedPhotographer?.id ? 'Edit Photographer' : 'Add a New Photographer'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label='Name'
                            fullWidth
                            {...register('name', { required: true })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label='Birth Date'
                            type='date'
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            {...register('birth', { required: true })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label='Death Date'
                            type='date'
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            {...register('death')}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label='Age'
                            type='number'
                            fullWidth
                            {...register('age', { required: true })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label='Profile Picture URL'
                            fullWidth
                            {...register('profilepicUrl', { required: true })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label='Description'
                            fullWidth
                            multiline
                            rows={4}
                            {...register('description', { required: true })}
                        />
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        display={'flex'}
                        justifyContent={'flex-end'}
                    >
                        <Button variant='contained' type='submit' sx={{ mr: 2 }}>
                            Submit
                        </Button>
                        <Button variant='outlined' onClick={handleClose}>
                            Close
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Dialog>
    );
};

export default PhotographerDialog;