import { Paper, TableContainer } from "@mui/material";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Button } from "@mui/material";
import User from "../model/User";
import useUserStore from "../stores/UserStore";
import AdminUserEditModal from "../components/AdminUserEditModal";
import { useInRouterContext } from "react-router-dom";
import { useInterval } from "../hooks/useInterval";
import axios from "axios";


export const AdminPage = () => {
    
        const [selectedUser, setSelectedUser] = useState<User | null>(null);
        const [loadingUsers, setLoadingUsers] = useState(false);
        const userStore = useUserStore();
        const [suspiciousUsers, setSuspiciousUsers] = useState<{id: number, count: number}[]>([]);

        useInterval(() => {
            axios.get('/api/users/suspicious',{
                    method: "GET",
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
            }).then((res) => {
                setSuspiciousUsers(res.data);
            })
        }, 20000);


        if (userStore.users.length === 0 && !loadingUsers) {
            setLoadingUsers(true);
            userStore.fetchUsers().then(() => {
                setLoadingUsers(false);
            });
        }

        const handleEditUser = async (user: User) => {
            await userStore.updateUser(user);
            await userStore.fetchUsers();
        };
    
        const handleDeleteUser = async (id: number) => {
            await userStore.deleteUser(userStore.users.find((user) => user.id === id) as User);
            await userStore.fetchUsers();
        };

    return (
    <div>
      <h1>Admin Page</h1>
        {selectedUser && (<AdminUserEditModal user={selectedUser} open={!!selectedUser} onClose={() => setSelectedUser(null)} onSubmit={handleEditUser} />)}
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Actions</TableCell>
                        <TableCell>Sus score</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {userStore.users.map((user) => (
                        <TableRow key={user.id} style={{background: suspiciousUsers.find(u => u.id === user.id) ? "#FFCCCB" : "inherit" }}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                                <Button onClick={() => setSelectedUser(user)}>Edit</Button>
                                <Button onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                            </TableCell>
                            <TableCell>
                                {suspiciousUsers.find(u => u.id === user.id)?.count ?? ""}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        </div>
  );
}
