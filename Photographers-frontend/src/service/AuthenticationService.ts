import { authedFetch } from "../helpers/authedFetch";
import User from "../model/User";

export async function GetAllUsers(): Promise<User[]> {
    const usersRes = await authedFetch(`/api/users`, {
        method: "GET",
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
    const userRes = await authedFetch(`/api/users/me`, {
        method: "GET",
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

export async function Login(username: string, password: string, TwoFACode:string): Promise<User> {
    const loginRes = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password , TwoFACode}),
    });

    if (!loginRes.ok) {
        const result = await loginRes.json();
        if (result.error) {
            throw new Error("Failed to login: " + result.error);
        }
        throw new Error("Failed to login");
    }
    const result = await loginRes.json()
    const token = result.token as string;
    localStorage.setItem("authtoken", token);

    return await CurrentUser();
}

export async function Logout(): Promise<void> {
    localStorage.removeItem("authtoken");
    window.location.href = '/';
}

export async function Register(username: string, password: string): Promise<string> {
    const registerRes = await fetch(`/api/auth/register`, {
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
    return userData.twoFactorSecret as string;
}

export async function UpdateUser(userId: number, userData: Partial<User>): Promise<User> {
    const updateRes = await authedFetch(`/api/users/${userId}`, {
        method: "PUT",
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
    const deleteRes = await authedFetch(`/api/users/${userId}`, {
        method: "DELETE",
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
    const userRes = await authedFetch(`/api/auth/status`, {
        method: "GET",
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

export async function Check2FACodeValue(code: string, username: string): Promise<boolean> {
    const codeCheckResult = await fetch(`/api/auth/check2FA?code=${code}&username=${username}`, {
        method: "GET",
    })
    const bodyParsed = await codeCheckResult.json();
    return bodyParsed.valid;
}