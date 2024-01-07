// @ts-check

import _ from 'lodash';
import fastify from 'fastify';

import init from '../server/plugin.js';
import encrypt from '../server/lib/secure.cjs';
import { getTestData, prepareData } from './helpers/index.js';

describe('test users CRUD', () => {
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
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    const params = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      payload: {
        data: params,
      },
    });

    expect(response.statusCode).toBe(302);
    const expected = {
      ..._.omit(params, 'password'),
      passwordDigest: encrypt(params.password),
    };
    const user = await models.user.query().findOne({ email: params.email });
    expect(user).toMatchObject(expected);
  });

  it('update', async () => {
    const oldParams = testData.users.existing;
    const newParams = testData.users.new;

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateUser', { id: '2' }),
      cookies: cookie,
      payload: {
        data: newParams,
      },
    });

    expect(response.statusCode).toBe(302);

    const expected = {
      ..._.omit(newParams, 'password'),
      passwordDigest: encrypt(newParams.password),
    };
    const user = await models.user.query().findOne({ email: newParams.email });
    expect(user).toMatchObject(expected);

    const nonExistingUser = await models.user.query().findOne({ email: oldParams.email });
    expect(nonExistingUser).toBeFalsy();
  });

  it('delete', async () => {
    const params = testData.users.existing;
    // пытаемся удалить с правами пользователя
    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id: '2' }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const deletedUser = await models.user.query().findOne({ email: params.email });
    // удаления не поизошло, т.к. пользователь связан с задачей
    expect(deletedUser).toBeTruthy();

    // удаляем задачу, с которой связан авторизированный пользователь и которая им же создана
    await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteTask', { id: '2' }),
      cookies: cookie,
    });

    // повторная попытка удалить пользователя
    await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id: '2' }),
      cookies: cookie,
    });

    const deletedUser2 = await models.user.query().findById(2);

    expect(deletedUser2).toBeFalsy();
  });

  afterEach(async () => {
    // Пока Segmentation fault: 11
    // после каждого теста откатываем миграции
    await knex('users').truncate();
    await knex('tasks').truncate();
    await knex('labels').truncate();
    await knex('statuses').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
