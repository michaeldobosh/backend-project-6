import fastify from 'fastify';

import init from '../server/plugin.js';
import { getTestData, prepareData } from './helpers/index.js';

describe('test labels CRUD', () => {
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
      url: app.reverse('labels'),
    });

    expect(responseWithOutAuth.statusCode).toBe(302);

    const responseWithAuth = await app.inject({
      method: 'GET',
      url: app.reverse('labels'),
      cookies: cookie,
    });

    expect(responseWithAuth.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newLabel'),
    });

    expect(response.statusCode).toBe(302);

    const responseWithAuth = await app.inject({
      method: 'GET',
      url: app.reverse('newLabel'),
      cookies: cookie,
    });

    expect(responseWithAuth.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.labels.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      cookies: cookie,
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);

    const expected = params;
    const label = await models.label.query().findOne({ name: params.name });
    expect(label).toMatchObject(expected);
  });

  it('update', async () => {
    const oldParams = testData.labels.existing;
    const newParams = testData.labels.new;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateLabel', { id: '1' }),
      cookies: cookie,
      payload: {
        data: newParams,
      },
    });

    expect(response.statusCode).toBe(302);

    const expected = newParams;
    const label = await models.label.query().findOne({ name: newParams.name });
    expect(label).toMatchObject(expected);

    const nonExistingLabel = await models.label.query().findOne({ name: oldParams.name });
    expect(nonExistingLabel).toBeFalsy();
  });

  it('delete', async () => {
    const params = testData.labels.existing;
    await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteLabel', { id: '1' }),
    });

    const deletedLabel = await models.label.query().findOne({ name: params.name });
    expect(deletedLabel).toBeTruthy();

    // метка не удалится потому что связана с задачей
    await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteLabel', { id: '1' }),
      cookies: cookie,
    });

    const deletedLabel2 = await models.label.query().findOne({ name: params.name });
    expect(deletedLabel2).toBeTruthy();

    const params2 = testData.labels.existing2;

    const responseWithAuth = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteLabel', { id: '2' }),
      cookies: cookie,
    });

    expect(responseWithAuth.statusCode).toBe(302);

    const deletedLabel3 = await models.label.query().findOne({ name: params2.name });
    expect(deletedLabel3).toBeFalsy();
  });

  afterEach(async () => {
    // Пока Segmentation fault: 11
    // после каждого теста откатываем миграции
    await knex('labels').truncate();
    await knex('tasks').truncate();
    await knex('users').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
