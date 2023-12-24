// import fastify from 'fastify';

// import init from '../server/plugin.js';
// import { getTestData, prepareData } from './helpers/index.js';

// describe('test statuses CRUD', () => {
//   let app;
//   let knex;
//   let models;
//   let cookie;
//   const testData = getTestData();

//   beforeAll(async () => {
//     app = fastify({
//       exposeHeadRoutes: false,
//       logger: { target: 'pino-pretty' },
//     });
//     await init(app);
//     knex = app.objection.knex;
//     models = app.objection.models;

//     // тесты не должны зависеть друг от друга
//     // перед каждым тестом выполняем миграции
//     // и заполняем БД тестовыми данными
//   });

//   beforeEach(async () => {
//     await knex.migrate.latest();
//     await prepareData(app);

//     const responseSignIn = await app.inject({
//       method: 'POST',
//       url: app.reverse('session'),
//       payload: {
//         data: testData.users.existing,
//       },
//     });

//     const [sessionCookie] = responseSignIn.cookies;
//     const { name, value } = sessionCookie;
//     cookie = { [name]: value };
//   });

//   it('index', async () => {
//     const responseWithOutAuth = await app.inject({
//       method: 'GET',
//       url: app.reverse('statuses'),
//     });

//     expect(responseWithOutAuth.statusCode).toBe(302);

//     const responseWithAuth = await app.inject({
//       method: 'GET',
//       url: app.reverse('statuses'),
//       cookies: cookie,
//     });

//     expect(responseWithAuth.statusCode).toBe(200);
//   });

//   it('new', async () => {
//     const response = await app.inject({
//       method: 'GET',
//       url: app.reverse('newStatus'),
//     });

//     expect(response.statusCode).toBe(302);

//     const responseWithAuth = await app.inject({
//       method: 'GET',
//       url: app.reverse('newStatus'),
//       cookies: cookie,
//     });

//     expect(responseWithAuth.statusCode).toBe(200);
//   });

//   it('create', async () => {
//     const params = testData.statuses.new;

//     const response = await app.inject({
//       method: 'POST',
//       url: app.reverse('statuses'),
//       cookies: cookie,
//       payload: {
//         data: params,
//       },
//     });

//     expect(response.statusCode).toBe(302);

//     const expected = params;
//     const status = await models.status.query().findOne({ name: params.name });
//     expect(status).toMatchObject(expected);
//   });

//   it('update', async () => {
//     const oldParams = testData.statuses.existing;
//     const newParams = testData.statuses.new;

//     const response = await app.inject({
//       method: 'PATCH',
//       url: '/statuses/1',
//       cookies: cookie,
//       payload: {
//         data: newParams,
//       },
//     });

//     expect(response.statusCode).toBe(302);

//     const expected = newParams;
//     const status = await models.status.query().findOne({ name: newParams.name });
//     expect(status).toMatchObject(expected);

//     const nonExistingStatus = await models.status.query().findOne({ name: oldParams.name });
//     expect(nonExistingStatus).toBeFalsy();
//   });

//   it('delete', async () => {
//     const responseWithOutAuth = await app.inject({
//       method: 'DELETE',
//       url: '/statuses/1',
//     });

//     expect(responseWithOutAuth.statusCode).toBe(200);

//     const responseWithAuth = await app.inject({
//       method: 'DELETE',
//       url: '/statuses/1',
//       cookies: cookie,
//     });

//     expect(responseWithAuth.statusCode).toBe(302);

//     const params = testData.statuses.existing;
//     await models.status.query().findOne({ name: params.name }).delete();
//     const deletedStatus = await models.status.query().findOne({ name: params.name });
//     expect(deletedStatus).toBeFalsy();
//   });

//   afterEach(async () => {
//     // Пока Segmentation fault: 11
//     // после каждого теста откатываем миграции
//     await knex.migrate.rollback();
//   });

//   afterAll(async () => {
//     await app.close();
//   });
// });
