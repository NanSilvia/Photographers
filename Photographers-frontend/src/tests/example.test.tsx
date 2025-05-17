// import { render, act } from '@testing-library/react';
// import { create } from 'zustand';
// import usePhotographerStore, { PhotographerStoreState } from '../stores/PhotographerStore';  // Now imported correctly
// import Photographer from '../model/Photographer';

// // Create a mock Photographer List
// const mockPhotographerList: Photographer[] = [
//     {
//         id: 1,
//         name: 'John Doe',
//         birth: new Date('1985-05-20'),
//         death: null,
//         profilepicUrl: 'https://example.com/john.jpg',
//         description: 'A talented photographer',
//     },
//     {
//         id: 2,
//         name: 'Jane Smith',
//         birth: new Date('1990-07-15'),
//         death: null,
//         profilepicUrl: 'https://example.com/jane.jpg',
//         description: 'An amazing landscape photographer',
//     },
// ];

// describe('PhotographerStore', () => {
//     // Helper function to reset the store state for each test
//     const resetStore = () => {
//         create<PhotographerStoreState>((set) => ({
//             opened: false,
//             selectedPhotographer: null,
//             photographers: [...mockPhotographerList],
//             handleOpen: (p?: Photographer) => set({ opened: true, selectedPhotographer: p || null }),
//             handleClose: () => set({ opened: false, selectedPhotographer: null }),
//             addPhotographer: async (p) => set((state) => ({ photographers: [...state.photographers, p] })),
//             editPhotographer: async (p: Photographer) =>
//                 set((state) => ({
//                     photographers: state.photographers.map((photog) =>
//                         photog.id === p.id ? p : photog
//                     ),
//                     selectedPhotographer: state.selectedPhotographer?.id === p.id ? p : state.selectedPhotographer,
//                 })),
//             deletePhotographer:  async (pId: number) =>
//                 set((state) => ({
//                     photographers: state.photographers.filter((photog) => photog.id !== pId),
//                     selectedPhotographer: state.selectedPhotographer?.id === pId ? null : state.selectedPhotographer,
//                 })),
//         }));
//     };

//     // Test Add Photographer
//     it('should add a new photographer', () => {
//         resetStore();
//         const { getState } = usePhotographerStore;
//         const newPhotographer: Photographer = {
//             id: 3,
//             name: 'Alice Johnson',
//             birth: new Date('1995-08-25'),
//             death: null,
//             profilepicUrl: 'https://example.com/alice.jpg',
//             description: 'A rising star in photography',
//         };

//         act(() => {
//             getState().addPhotographer(newPhotographer);
//         });

//         const photographers = getState().photographers;
//         expect(photographers).toHaveLength(3);  // We now have 3 photographers
//         expect(photographers[2]).toEqual(newPhotographer);
//     });

//     // Test Delete Photographer
//     it('should delete a photographer', () => {
//         resetStore();
//         const { getState } = usePhotographerStore;

//         act(() => {
//             getState().deletePhotographer(1);  // Delete the photographer with id 1
//         });

//         const photographers = getState().photographers;
//         expect(photographers).toHaveLength(1);  // After deletion, only one photographer remains
//         expect(photographers[0].id).toBe(2);  // Jane Smith should be the only one remaining
//     });

//     // Test Edit Photographer
//     it('should update a photographer', () => {
//         resetStore();
//         const { getState } = usePhotographerStore;
//         const updatedPhotographer: Photographer = {
//             id: 2,
//             name: 'Jane Smith Updated',
//             birth: new Date('1990-07-15'),
//             death: null,
//             profilepicUrl: 'https://example.com/jane_updated.jpg',
//             description: 'An amazing landscape photographer with a new portfolio',
//         };

//         act(() => {
//             getState().editPhotographer(updatedPhotographer);
//         });

//         const photographers = getState().photographers;
//         const editedPhotographer = photographers.find((p) => p.id === 2);

//         expect(editedPhotographer?.name).toBe('Jane Smith Updated');
//         expect(editedPhotographer?.profilepicUrl).toBe('https://example.com/jane_updated.jpg');
//     });
// });
