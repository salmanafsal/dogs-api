const request = require('supertest');
// express app
const app = require('./index');

// db setup
const { sequelize, Dog } = require('./db');
const seed = require('./db/seedFn');
const {dogs} = require('./db/seedData');

describe('Endpoints', () => {
    // to be used in POST test
    const testDogData = {
        breed: 'Poodle',
        name: 'Sasha',
        color: 'black',
        description: 'Sasha is a beautiful black pooodle mix.  She is a great companion for her family.'
    };

    beforeAll(async () => {
        // rebuild db before the test suite runs
        await seed();
    });

    describe('GET /dogs', () => {
        it('should return list of dogs with correct data', async () => {
            // make a request
            const response = await request(app).get('/dogs');
            // assert a response code
            expect(response.status).toBe(200);
            // expect a response
            expect(response.body).toBeDefined();
            // toEqual checks deep equality in objects
            expect(response.body[0]).toEqual(expect.objectContaining(dogs[0]));
        });
    });

     describe('POST /dogs', () => {
        let createdDogId;

        it('should create a new dog and return the dog data', async () => {
        const response = await request(app)
            .post('/dogs')
            .send(testDogData)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200); // Assuming 201 Created is the expected status code

      // Store the created dog's ID for the next test
        createdDogId = response.body.id;

      // Assert that the response body matches the test data
        expect(response.body).toMatchObject(testDogData);
        expect(createdDogId).toBeDefined();
    });

    it('should retrieve the created dog from the database and match the test data', async () => {
      // Fetch the dog directly from the database using the ID
      const dogFromDb = await Dog.findByPk(createdDogId);

      // Assert that the dog exists and matches the test data
      expect(dogFromDb).not.toBeNull();
      expect(dogFromDb.breed).toBe(testDogData.breed);
      expect(dogFromDb.name).toBe(testDogData.name);
      expect(dogFromDb.color).toBe(testDogData.color);
      expect(dogFromDb.description).toBe(testDogData.description);
    });

    
  });

  describe('DELETE /dogs/:id', () => {
  it('should delete the dog with ID 1 and return an empty array upon querying', async () => {
    // Send DELETE request to /dogs/1
    const res = await request(app).delete('/dogs/1');
    expect(res.statusCode).toBe(200);

    // Query the database for all dogs
    const remainingDogs = await Dog.findAll({ where: { id: 1 } });

    // Assert that the returned array is empty
    expect(remainingDogs).toEqual([]);
  });
});


});