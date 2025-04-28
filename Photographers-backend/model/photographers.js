//In-memory storage for photographers
import myPhotographers from "./photogdb.js";
let photographers = myPhotographers;
// export const photographers = [];

// Get all photographers
export function getAllPhotographers() {
    return photographers;
}

// Get a single photographer by ID
export function getPhotographerById(id) {
    return photographers.find((p) => p.id === id);
}

// Add a new photographer
export function addPhotographer(photographer) {
    const newPhotographer = { id: Math.floor(Math.random() * 1000), ...photographer };
    photographers.push(newPhotographer);
    return newPhotographer;
}

// Update a photographer by ID
export function updatePhotographer(id, updatedData) {
    const index = photographers.findIndex((p) => p.id === id);
    if (index === -1) return null;

    photographers[index] = { ...photographers[index], ...updatedData };
    return photographers[index];
}

// Delete a photographer by ID
export function deletePhotographer(id) {
    const index = photographers.findIndex((p) => p.id === id);
    if (index === -1) return null;

    return photographers.splice(index, 1)[0]; // Remove and return the deleted photographer
}


// module.exports = {
//     photographers,
//     getAllPhotographers,
//     addPhotographer,
//     getPhotographerById,
//     updatePhotographer,
//     deletePhotographer
// };