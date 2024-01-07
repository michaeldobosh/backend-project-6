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

  it('filter', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/tasks?status=1&executor=1&creator=2',
      cookies: cookie,
    });
    const url = new URL(response.raw.req.url, 'http://localhost');
    const statusId = Number(url.searchParams.get('status'));
    const creatorId = Number(url.searchParams.get('creator'));
    const executorId = Number(url.searchParams.get('executor'));

    const expected = await models.task.query()
      .where({ statusId })
      .where({ creatorId })
      .where({ executorId });

    expect(response.statusCode).toBe(200);

    const task = await models.task.query().where({ id: 2 });
    expect(task).toMatchObject(expected);
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
      url: app.reverse('createTask'),
      cookies: cookie,
      payload: {
        data: { ...params, labels: [1, 2] },
      },
    });

    expect(response.statusCode).toBe(302);

    const expected = params;
    const task = await models.task.query().findOne({ name: params.name });
    const relate = await task.$relatedQuery('labels');
    expect(task).toMatchObject(expected);
    expect(!!relate).toBeTruthy();
  });

  it('update', async () => {
    const oldParams = testData.tasks.existing;
    const newParams = { name: 'Buy apples', statusId: 2, executorId: 1 };

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateTask', { id: '1' }),
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
    // Авторизован пользователь с ID=2, поэтому удалится только задача с creatorId=2
    const params = testData.tasks.existing;
    await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteTask', { id: '1' }),
      cookies: cookie,
    });

    const deletedTask = await models.task.query().findOne({ name: params.name });
    expect(deletedTask).toBeTruthy();

    const responseWithAuthCreator = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteTask', { id: '2' }),
      cookies: cookie,
    });

    expect(responseWithAuthCreator.statusCode).toBe(302);

    const params2 = testData.tasks.existing2;
    const deletedTask2 = await models.task.query().findOne({ name: params2.name });
    expect(deletedTask2).toBeFalsy();
  });

  afterEach(async () => {
    // Пока Segmentation fault: 11
    // после каждого теста откатываем миграции
    await knex('tasks').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
