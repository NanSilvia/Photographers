import User from "../model/User";

export async function GetAllUsers(): Promise<User[]> {
    const usersRes = await fetch(`/api/users`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!usersRes.ok) {
        const errorJson = await usersRes.json();
        if (errorJson.error) {
            throw new Error("Failed to fetch users: " + errorJson.error);
        }
        throw new Error("Failed to fetch users");
    }

    const usersData = await usersRes.json();
    return usersData as User[];
}

export async function CurrentUser(): Promise<User> {
    const userRes = await fetch(`/api/users/me`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!userRes.ok) {
        const errorJson = await userRes.json();
        if (errorJson.error) {
            throw new Error("Failed to fetch user data: " + errorJson.error);
        }
        throw new Error("Failed to fetch user data");
    }

    const userData = await userRes.json();
    return userData as User;
}

export async function Login(username: string, password: string): Promise<User> {
    const loginRes = await fetch(`/api/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    if (!loginRes.ok) {
        const errorJson = await loginRes.json();
        if (errorJson.error) {
            throw new Error("Failed to login: " + errorJson.error);
        }
        throw new Error("Failed to login");
    }

    return await CurrentUser();
}

export async function Logout(): Promise<void> {
    const logoutRes = await fetch(`/api/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!logoutRes.ok) {
        const errorJson = await logoutRes.json();
        if (errorJson.error) {
            throw new Error("Failed to logout: " + errorJson.error);
        }
        throw new Error("Failed to logout");
    }
}

export async function Register(username: string, password: string): Promise<User> {
    const registerRes = await fetch(`/api/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

    if (!registerRes.ok) {
        const errorJson = await registerRes.json();
        if (errorJson.error) {
            throw new Error("Failed to register: " + errorJson.error);
        }
        throw new Error("Failed to register");
    }

    const userData = await registerRes.json();
    return userData as User;
}

export async function UpdateUser(userId: number, userData: Partial<User>): Promise<User> {
    const updateRes = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });

    if (!updateRes.ok) {
        const errorJson = await updateRes.json();
        if (errorJson.error) {
            throw new Error("Failed to update user data: " + errorJson.error);
        }
        throw new Error("Failed to update user data");
    }

    const updatedUserData = await updateRes.json();
    return updatedUserData as User;
}

export async function DeleteUser(userId: number): Promise<void> {
    const deleteRes = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!deleteRes.ok) {
        const errorJson = await deleteRes.json();
        if (errorJson.error) {
            throw new Error("Failed to delete user: " + errorJson.error);
        }
        throw new Error("Failed to delete user");
    }
}

export async function IsAuthenticated(): Promise<boolean> {
    const userRes = await fetch(`/api/authstatus`, {
        method: "GET",
        credentials: "include",
    });
    if(!userRes.ok) {
        return false;
    }
    const msgData = await userRes.json();
    if(msgData.message == "Authenticated") {
        return true;
    }
    return false;
}