// @ts-check

import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const currentUserId = req.user?.id;
      const users = await models.user.query();
      reply.render('users/index', { users, currentUserId });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new models.user();
      reply.render('users/new', { user });
    })
    .post('/users', async (req, reply) => {
      const user = new models.user();
      user.$set(req.body.data);

      try {
        const validUser = await models.user.fromJson(req.body.data);
        await models.user.query().insert(validUser);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors: data });
      }
      return reply;
    })
    .get('/users/:id/edit', { name: 'userEditForm', preValidation: app.authenticate }, (req, reply) => {
      const userId = Number(req.params.id);
      const currentUser = req.user;

      if (userId === currentUser.id) {
        reply.render('users/edit', { user: currentUser });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .patch('/users/:id', { name: 'updateUser', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const user = new models.user();
      user.$set(req.body.data);

      try {
        const validUser = await models.user.fromJson(req.body.data);
        const selectedUser = await models.user.query().findOne({ id });
        await selectedUser.$query().patch(validUser);
        req.flash('info', i18next.t('flash.users.edit.success'));
        reply.redirect(app.reverse('users'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.edit.error'));
        reply.render('users/edit', { user, errors: data });
      }
      return reply;
    })
    .delete('/users/:id', { name: 'deleteUser', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const currentUserId = req.user?.id;
      const selectedUser = await models.user.query().findById(id);
      const tasks = await models.task.query();
      const creators = await models.task.relatedQuery('creators').for(tasks);
      const executors = await models.task.relatedQuery('executors').for(tasks);
      const hasRelation = !![...creators, ...executors].find((user) => user.id === Number(id));
      const isCurrent = selectedUser.id === Number(currentUserId);

      if (!isCurrent) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
        return reply;
      }

      try {
        if (hasRelation) {
          throw Error;
        }
        req.logOut();
        await models.user.query().delete().where({ id });
        req.flash('info', i18next.t('flash.users.delete.success'));
        reply.redirect(app.reverse('users'));
      } catch (error) {
        req.flash('error', i18next.t('flash.users.delete.error'));
        reply.redirect(app.reverse('users'));
      }
      return reply;
    });
};
