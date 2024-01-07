import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  app
    .get('/statuses', { name: 'statuses', preValidation: app.authenticate }, async (req, reply) => {
      const statuses = await models.status.query();
      reply.render('statuses/index', { statuses });
      return reply;
    })
    .get('/statuses/new', { name: 'newStatus', preValidation: app.authenticate }, async (req, reply) => {
      const status = new models.status();

      reply.render('statuses/new', { status });
      return reply;
    })
    .post('/statuses', { name: 'createStatus', preValidation: app.authenticate }, async (req, reply) => {
      req.body.data.name = req.body.data.name.trim();
      const status = new models.status();
      status.$set(req.body.data);

      try {
        const validstatus = await models.status.fromJson(req.body.data);
        await models.status.query().insert(validstatus);
        req.flash('info', i18next.t('flash.statuses.create.success'));
        reply.redirect(app.reverse('statuses'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.create.error'));
        reply.render('statuses/new', { status, errors: data });
      }
      return reply;
    })
    .get('/statuses/:id/edit', { name: 'editStatus', preValidation: app.authenticate }, async (req, reply) => {
      const statusId = req.params.id;
      const status = await models.status.query().findOne({ id: statusId });

      reply.render('statuses/edit', { status });
      return reply;
    })
    .patch('/statuses/:id', { name: 'updateStatus', preValidation: app.authenticate }, async (req, reply) => {
      const statusId = req.params.id;
      req.body.data.name = req.body.data.name.trim();
      const status = new models.status();
      status.$set(req.body.data);

      try {
        const validstatus = await models.status.fromJson(req.body.data);
        const selectedstatus = await models.status.query().findOne({ id: statusId });
        await selectedstatus.$query().patch(validstatus);
        req.flash('info', i18next.t('flash.statuses.edit.success'));
        reply.redirect(app.reverse('statuses'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.statuses.edit.error'));
        reply.render('statuses/edit', { status, errors: data });
      }
      return reply;
    })
    .delete('/statuses/:id', { name: 'deleteStatus', preValidation: app.authenticate }, async (req, reply) => {
      const statusId = req.params.id;
      const tasks = await models.task.query();
      const statuses = await models.task.relatedQuery('statuses').for(tasks);
      const hasRelation = !!statuses.find((status) => status.id === Number(statusId));

      if (!hasRelation) {
        await models.status.query().delete().where({ id: statusId });
        req.flash('info', i18next.t('flash.statuses.delete.success'));
        reply.redirect(app.reverse('statuses'));
      } else {
        req.flash('error', i18next.t('flash.statuses.delete.error'));
        reply.redirect(app.reverse('statuses'));
      }
    });
};
