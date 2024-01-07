import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  app
    .get('/labels', { name: 'labels', preValidation: app.authenticate }, async (req, reply) => {
      const labels = await models.label.query();
      reply.render('labels/index', { labels });
      return reply;
    })
    .get('/labels/new', { name: 'newLabel', preValidation: app.authenticate }, async (req, reply) => {
      const label = new models.label();

      reply.render('labels/new', { label });
      return reply;
    })
    .post('/labels', { name: 'createLabel', preValidation: app.authenticate }, async (req, reply) => {
      req.body.data.name = req.body.data.name.trim();
      const label = new models.label();
      label.$set(req.body.data);

      try {
        const validlabel = await models.label.fromJson(req.body.data);
        await models.label.query().insert(validlabel);
        req.flash('info', i18next.t('flash.labels.create.success'));
        reply.redirect(app.reverse('labels'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        reply.render('labels/new', { label, errors: data });
      }
      return reply;
    })
    .get('/labels/:id/edit', { name: 'editLabel', preValidation: app.authenticate }, async (req, reply) => {
      const labelId = req.params.id;
      const label = await models.label.query().findOne({ id: labelId });

      reply.render('labels/edit', { label });
      return reply;
    })
    .patch('/labels/:id', { name: 'updateLabel', preValidation: app.authenticate }, async (req, reply) => {
      const labelId = req.params.id;
      req.body.data.name = req.body.data.name.trim();
      const label = new models.label();
      label.$set(req.body.data);

      try {
        const validlabel = await models.label.fromJson(req.body.data);
        const selectedlabel = await models.label.query().findOne({ id: labelId });
        await selectedlabel.$query().patch(validlabel);
        req.flash('info', i18next.t('flash.labels.edit.success'));
        reply.redirect(app.reverse('labels'));
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.edit.error'));
        reply.render('labels/edit', { label, errors: data });
      }
      return reply;
    })
    .delete('/labels/:id', { name: 'deleteLabel', preValidation: app.authenticate }, async (req, reply) => {
      const labelId = req.params.id;
      const tasks = await models.task.query();
      const labels = await models.task.relatedQuery('labels').for(tasks);
      const hasRelation = !!labels.find((label) => label.id === Number(labelId));

      if (!hasRelation) {
        await models.label.query().delete().where({ id: labelId });
        req.flash('info', i18next.t('flash.labels.delete.success'));
        reply.redirect(app.reverse('labels'));
      } else {
        req.flash('error', i18next.t('flash.labels.delete.error'));
        reply.redirect(app.reverse('labels'));
      }
    });
};
