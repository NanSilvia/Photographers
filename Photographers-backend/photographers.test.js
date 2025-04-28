const request = require('supertest');
const app = require('./server.js'); // Adjust path if necessary

const {
    getAllPhotographers,
    addPhotographer,
    getPhotographerById,
    updatePhotographer,
    deletePhotographer,
    photographers
} = require('./model/photographers.js');

// Suppress logs during tests to prevent "Cannot log after tests are done" error
beforeAll(() => {
    global.console = {
        ...console,
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    };
});

// Reset the photographers array before each test
beforeEach(() => {
    if (!Array.isArray(photographers)) {
        throw new Error('photographers is not an array. Check the import.');
    }

    photographers.length = 0; // Reset the array
    photographers.push(
        { id: 1, name: 'Ansel Adams', birth: '1902-02-20', death: '1984-04-22', profilepicUrl: 'url1', description: 'Landscape photographer' },
        { id: 2, name: 'Dorothea Lange', birth: '1895-05-26', death: '1965-10-11', profilepicUrl: 'url2', description: 'Documentary photographer' },
        { id: 3, name: 'Steve McCurry', birth: '1950-02-24', death: null, profilepicUrl: 'url3', description: 'Photojournalist' }
    );
});


describe('Model Functions', () => {
    test('getAllPhotographers should return all photographers', () => {
        const result = getAllPhotographers();
        expect(result).toHaveLength(3);
        expect(result[0].name).toBe('Ansel Adams');
    });

    test('getPhotographerById should return a photographer by id', () => {
        const result = getPhotographerById(2);
        expect(result.name).toBe('Dorothea Lange');
    });

    test('getPhotographerById should return undefined for non-existent id', () => {
        const result = getPhotographerById(99);
        expect(result).toBeUndefined();
    });

    test('addPhotographer should add a new photographer', () => {
        const newPhotographer = {
            name: 'Test Photographer',
            birth: '2000-01-01',
            profilepicUrl: 'test-url',
            description: 'Test description'
        };
        
        const result = addPhotographer(newPhotographer);
        expect(result).toHaveProperty('id');
        expect(result.name).toBe('Test Photographer');
        expect(photographers).toHaveLength(4);
    });

    test('updatePhotographer should update an existing photographer', () => {
        const updatedData = { name: 'Updated Name', description: 'Updated description' };
        const result = updatePhotographer(1, updatedData);
        
        expect(result.name).toBe('Updated Name');
        expect(result.description).toBe('Updated description');
        expect(result.birth).toBe('1902-02-20');
    });

    test('updatePhotographer should return null for non-existent id', () => {
        const result = updatePhotographer(99, { name: 'Test' });
        expect(result).toBeNull();
    });

    test('deletePhotographer should delete a photographer', () => {
        const result = deletePhotographer(2);
        
        expect(result.name).toBe('Dorothea Lange');
        expect(photographers).toHaveLength(2);
        expect(getPhotographerById(2)).toBeUndefined();
    });

    test('deletePhotographer should return null for non-existent id', () => {
        const result = deletePhotographer(99);
        expect(result).toBeNull();
    });
});

describe('API Endpoints', () => {
    test('GET /photographers should return all photographers', async () => {
        const response = await request(app).get('/photographers');
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(3);
    });

    test('GET /photographers?alive=true should return only alive photographers', async () => {
        const response = await request(app).get('/photographers?alive=true');
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].name).toBe('Steve McCurry');
    });

    test('GET /photographers/:id should return a specific photographer', async () => {
        const response = await request(app).get('/photographers/1');
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Ansel Adams');
    });

    test('GET /photographers/:id should return 404 for non-existent id', async () => {
        const response = await request(app).get('/photographers/99');
        expect(response.status).toBe(404);
    });

    test('GET /photographers/:id should return 400 for invalid id format', async () => {
        const response = await request(app).get('/photographers/abc');
        expect(response.status).toBe(400);
    });

    test('POST /photographers should create a new photographer', async () => {
        const newPhotographer = {
            name: 'New Photographer',
            birth: '1990-01-01',
            profilepicUrl: 'new-url',
            description: 'New description'
        };
        
        const response = await request(app)
            .post('/photographers')
            .send(newPhotographer);
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('New Photographer');
    });

    test('POST /photographers should return 400 for missing required fields', async () => {
        const invalidPhotographer = {
            birth: '1990-01-01',
            profilepicUrl: 'new-url',
            description: 'New description'
        };
        
        const response = await request(app)
            .post('/photographers')
            .send(invalidPhotographer);
        
        expect(response.status).toBe(400);
    });

    test('PUT /photographers/:id should update an existing photographer', async () => {
        const updatedData = { name: 'Updated Name', description: 'Updated description' };
        
        const response = await request(app)
            .put('/photographers/1')
            .send(updatedData);
        
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Updated Name');
        expect(response.body.description).toBe('Updated description');
    });

    test('PUT /photographers/:id should return 404 for non-existent id', async () => {
        const response = await request(app)
            .put('/photographers/99')
            .send({ name: 'Test' });
        
        expect(response.status).toBe(404);
    });

    test('DELETE /photographers/:id should delete a photographer', async () => {
        const response = await request(app).delete('/photographers/1');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Photographer deleted successfully');
        expect(response.body.deletedPhotographer.name).toBe('Ansel Adams');
    });

    test('DELETE /photographers/:id should return 404 for non-existent id', async () => {
        const response = await request(app).delete('/photographers/99');
        expect(response.status).toBe(404);
    });

    test('Count how many photographers are alive', () => {
        const alivePhotographers = photographers.filter(p => p.death === null);
        expect(alivePhotographers.length).toBe(1);
        expect(alivePhotographers[0].name).toBe('Steve McCurry');
    });
});
