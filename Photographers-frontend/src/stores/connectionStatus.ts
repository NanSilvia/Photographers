import { create } from 'zustand';

interface ConnectionStatusState {
    isOnline: boolean;
}

const useConnectionStatusStore = create<ConnectionStatusState>(set => {
    const updateOnlineStatus = () => {set({ isOnline: navigator.onLine }); console.log("aaaaa")}

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return {
        isOnline: navigator.onLine,
        destroy: () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        },
    };
});

export default useConnectionStatusStore;
