// @ts-check

import i18next from 'i18next';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const currentUserId = req?.user?.id;
      const users = await app.objection.models.user.query();
      reply.render('users/index', { users, currentUserId });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new app.objection.models.user();
      reply.render('users/new', { user });
    })
    .post('/users', async (req, reply) => {
      const user = new app.objection.models.user();
      user.$set(req.body.data);

      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(validUser);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors: data });
      }

      return reply;
    })
    .get('/users/:id/edit', { name: 'userEditForm' }, (req, reply) => {
      const user = req?.user;
      if (user) {
        reply.render('users/edit', { user });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .patch('/users/:id', { name: 'editUser' }, async (req, reply) => {
      const id = req?.user?.id;
      const user = new app.objection.models.user();
      user.$set(req.body.data);

      try {
        const validUser = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query(`UPDATE users SET
            first_name = ${validUser.firstName},
            last_name = ${validUser.lastName},
            email = ${validUser.email},
            password_digest = ${validUser.passwordDigest},
            WHERE id = ${id}
        `);
        req.flash('info', i18next.t('flash.users.edit.success'));
        reply.redirect(app.reverse('root'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.users.edit.error'));
        reply.render('users/edit', { user, errors: data });
      }
    })
    .delete('/users/:id', { name: 'deleteUser' }, async (req, reply) => {
      const id = req.user?.id;
      try {
        req.logOut();
        await app.objection.models.user.query().delete().where({ id });
        req.flash('info', i18next.t('flash.users.delete.success'));
        reply.redirect(app.reverse('root'));
      } catch (err) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    });
};
