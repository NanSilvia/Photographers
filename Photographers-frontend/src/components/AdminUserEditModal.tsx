import React, { useState } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    FormControl, 
    InputLabel, 
    Select, 
    SelectChangeEvent,
    MenuItem,
    Box
} from '@mui/material';
import User from '../model/User';

interface AdminUserEditModalProps {
    open: boolean; // changed from 'show' to 'open' as per MUI convention
    user: User;
    onClose: () => void; // changed from 'onHide' to 'onClose' as per MUI convention
    onSubmit: (updatedUser: User) => void;
}

const AdminUserEditModal: React.FC<AdminUserEditModalProps> = ({ open, user, onClose, onSubmit }) => {
    const [formData, setFormData] = useState<Omit<User, 'id'>>({
        username: user.username,
        role: user.role
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            id: user.id
        });
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const name = e.target.name as keyof Omit<User, 'id'>;
        const value = e.target.value as string;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleRoleChange = (e: SelectChangeEvent) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            role: value
        }));
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Edit User</DialogTitle>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Role</InputLabel>
                        <Select
                            name="role"
                            value={formData.role}
                            onChange={handleRoleChange}
                            label="Role"
                            required
                        >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default AdminUserEditModal;