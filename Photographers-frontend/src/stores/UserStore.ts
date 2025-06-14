import { create } from 'zustand';
import * as AuthenticationService from '../service/AuthenticationService';
import User from '../model/User';

export interface UserStore {
    user: User | null;
    authenticated: boolean;
    users: User[];
    fetchUsers: () => Promise<void>;
    fetchStatus: () => Promise<void>;
    setUser: (user: User | null) => void;
    setAuthenticated: (authenticated: boolean) => void;
    login: (username: string, password: string, TwoFACode: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    deleteUser: (user: User) => Promise<void>;
    register: (username: string, password: string) => Promise<string>;
}

const useUserStore = create<UserStore>((set, get) => ({
    user: null,
    authenticated: false,
    users: [],
    fetchUsers: async () => {
        const users = await AuthenticationService.GetAllUsers();
        set({ users });
    },
    fetchStatus: async () => {
        const authstatus = await AuthenticationService.IsAuthenticated();
        if(!authstatus) {
            if (get().authenticated) {
                set({ user: null, authenticated: false });
            }
            return;
        }
        const user = await AuthenticationService.CurrentUser();
        //verifica daca userul curet e acelasi cu cel din store
        if(JSON.stringify(user) === JSON.stringify(get().user)) {
            return;
        }
        set({ user, authenticated: true });
    },
    setUser: (user: User | null) => set({ user }),
    setAuthenticated: (authenticated: boolean) => set({ authenticated }),
    login: async (username: string, password: string, TwoFACode: string) => {
        const user = await AuthenticationService.Login(username, password, TwoFACode);
        console.log('User logged in:', user);
        set({ user, authenticated: true });
    },
    logout: async () => {
        await AuthenticationService.Logout();
        set({ user: null, authenticated: false });
    },
    updateUser: async (user: User) => {
        const updatedUser = await AuthenticationService.UpdateUser(user.id, user);
        const currentUser = get().user;
        if(currentUser && currentUser?.id == updatedUser.id) {
            set({ user: updatedUser });
        }
    },
    deleteUser: async (user: User) => {
        await AuthenticationService.DeleteUser(user.id);
        const currentUser = get().user;
        if(currentUser && currentUser?.id == user.id) {
            set({ user: null, authenticated: false });
        }
    },
    register: async (username: string, password: string) => {
        return await AuthenticationService.Register(username, password);
    },
}));

export default useUserStore;
