const authToken = localStorage.getItem('authtoken');

export const authedFetch = async (input: string | URL | globalThis.Request, init?: RequestInit): Promise<Response> => {
    return fetch(input, {
        ...init,
        headers: {
            ...init?.headers,
            "Authorization": `Bearer ${authToken}`
        }
    })
}
