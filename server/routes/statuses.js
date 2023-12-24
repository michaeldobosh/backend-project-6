import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  app
    .get('/statuses', { name: 'statuses' }, async (req, reply) => {
      const statuses = await models.status.query();

      if (req.isAuthenticated()) {
        reply.render('statuses/index', { statuses });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus' }, async (req, reply) => {
      const status = new models.status();

      if (req.isAuthenticated()) {
        reply.render('statuses/new', { status });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    })
    .post('/statuses', { name: 'createStatus' }, async (req, reply) => {
      const status = new models.status();
      status.$set(req.body.data);

      try {
        if (req.isAuthenticated()) {
          const validStatus = await models.status.fromJson(req.body.data);
          validStatus.name = validStatus.name.trim();
          await models.status.query().insert(validStatus);
          req.flash('info', i18next.t('flash.statuses.create.success'));
          reply.redirect(app.reverse('statuses'));
        } else {
          req.flash('error', i18next.t('flash.authError'));
          reply.redirect(app.reverse('root'));
        }
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        reply.render('statuses/new', { status, errors: data });
      }
      return reply;
    })
    .get('/statuses/:id/edit', async (req, reply) => {
      const selectedStatusId = req.params.id;
      const status = await models.status.query().findOne({ id: selectedStatusId });

      if (req.isAuthenticated()) {
        reply.render('statuses/edit', { status });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    })
    .patch('/statuses/:id', async (req, reply) => {
      const { id } = req.params;
      const status = new models.status();
      status.$set(req.body.data);

      try {
        if (req.isAuthenticated()) {
          const validStatus = await models.status.fromJson(req.body.data);
          const selectedStatus = await models.status.query().findOne({ id });
          await selectedStatus.$query().patch(validStatus);
          req.flash('info', i18next.t('flash.statuses.edit.success'));
          reply.redirect(app.reverse('statuses'));
        } else {
          req.flash('error', i18next.t('flash.authError'));
          reply.redirect(app.reverse('root'));
        }
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.edit.error'));
        reply.render('statuses/edit', { status, errors: data });
      }
      return reply;
    })
    .delete('/statuses/:id', { name: 'deleteStatus' }, async (req, reply) => {
      const { id } = req.params;

      if (req.isAuthenticated()) {
        await models.status.query().delete().where({ id });
        req.flash('info', i18next.t('flash.statuses.delete.success'));
        reply.redirect(app.reverse('statuses'));
      } else {
        req.flash('error', i18next.t('flash.statuses.delete.error'));
        reply.render('statuses');
      }
    });
};
