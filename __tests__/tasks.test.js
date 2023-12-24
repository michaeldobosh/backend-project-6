import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test tasks CRUD', () => {
  let app;
  let knex;
  let models;
  let cookie;
  const testData = getTestData();

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    await init(app);
    knex = app.objection.knex;
    models = app.objection.models;

    // тесты не должны зависеть друг от друга
    // перед каждым тестом выполняем миграции
    // и заполняем БД тестовыми данными
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await prepareData(app);

    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.existing,
      },
    });

    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    cookie = { [name]: value };
  });

  it('index', async () => {
    const responseWithOutAuth = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
    });

    expect(responseWithOutAuth.statusCode).toBe(302);

    const responseWithAuth = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
      cookies: cookie,
    });

    expect(responseWithAuth.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTasks'),
    });

    expect(response.statusCode).toBe(302);

    const responseWithAuth = await app.inject({
      method: 'GET',
      url: app.reverse('newTasks'),
      cookies: cookie,
    });

    expect(responseWithAuth.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.tasks.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      cookies: cookie,
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);

    const expected = params;
    const task = await models.task.query().findOne({ name: params.name });
    expect(task).toMatchObject(expected);
  });

  it('update', async () => {
    const oldParams = testData.tasks.existing;
    const newParams = testData.tasks.new;

    const response = await app.inject({
      method: 'PATCH',
      url: '/tasks/1',
      cookies: cookie,
      payload: {
        data: newParams,
      },
    });

    expect(response.statusCode).toBe(302);

    const expected = newParams;
    const task = await models.task.query().findOne({ name: newParams.name });
    expect(task).toMatchObject(expected);

    const nonExistingTask = await models.task.query().findOne({ name: oldParams.name });
    expect(nonExistingTask).toBeFalsy();
  });

  it('delete', async () => {
    await app.inject({
      method: 'DELETE',
      url: '/tasks/1',
      cookies: cookie,
    });

    const params = testData.tasks.existing;
    await models.task.query().findOne({ name: params.name }).delete();
    const deletedTask = await models.task.query().findOne({ name: params.name });
    expect(deletedTask).toBeTruthy();

    const responseWithAuthCreator = await app.inject({
      method: 'DELETE',
      url: '/tasks/2',
      cookies: cookie,
    });

    expect(responseWithAuthCreator.statusCode).toBe(302);

    const params2 = testData.tasks.existing2;
    await models.task.query().findOne({ name: params2.name }).delete();
    const deletedTask2 = await models.task.query().findOne({ name: params2.name });
    expect(deletedTask2).toBeFalsy();
  });

  afterEach(async () => {
    // Пока Segmentation fault: 11
    // после каждого теста откатываем миграции
    await knex.migrate.rollback();
  });

  afterAll(async () => {
    await app.close();
  });
});
