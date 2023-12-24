import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  app
    .get('/labels', { name: 'labels' }, async (req, reply) => {
      const labels = await models.label.query();

      if (req.isAuthenticated()) {
        reply.render('labels/index', { labels });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    })
    .get('/labels/new', { name: 'newLabel' }, async (req, reply) => {
      const label = new models.label();

      if (req.isAuthenticated()) {
        reply.render('labels/new', { label });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    })
    .post('/labels', { name: 'createLabel' }, async (req, reply) => {
      const label = new models.label();
      label.$set(req.body.data);

      try {
        if (req.isAuthenticated()) {
          const validlabel = await models.label.fromJson(req.body.data);
          validlabel.name = validlabel.name.trim();
          await models.label.query().insert(validlabel);
          req.flash('info', i18next.t('flash.labels.create.success'));
          reply.redirect(app.reverse('labels'));
        } else {
          req.flash('error', i18next.t('flash.authError'));
          reply.redirect(app.reverse('root'));
        }
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.create.error'));
        reply.render('labels/new', { label, errors: data });
      }
      return reply;
    })
    .get('/labels/:id/edit', async (req, reply) => {
      const selectedlabelId = req.params.id;
      const label = await models.label.query().findOne({ id: selectedlabelId });

      if (req.isAuthenticated()) {
        reply.render('labels/edit', { label });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    })
    .patch('/labels/:id', async (req, reply) => {
      const { id } = req.params;
      const label = new models.label();
      label.$set(req.body.data);

      try {
        if (req.isAuthenticated()) {
          const validlabel = await models.label.fromJson(req.body.data);
          const selectedlabel = await models.label.query().findOne({ id });
          await selectedlabel.$query().patch(validlabel);
          req.flash('info', i18next.t('flash.labels.edit.success'));
          reply.redirect(app.reverse('labels'));
        } else {
          req.flash('error', i18next.t('flash.authError'));
          reply.redirect(app.reverse('root'));
        }
      } catch ({ data }) {
        req.flash('error', i18next.t('flash.labels.edit.error'));
        reply.render('labels/edit', { label, errors: data });
      }
      return reply;
    })
    .delete('/labels/:id', { name: 'deleteLabel' }, async (req, reply) => {
      const { id } = req.params;

      if (req.isAuthenticated()) {
        await models.label.query().delete().where({ id });
        req.flash('info', i18next.t('flash.labels.delete.success'));
        reply.redirect(app.reverse('labels'));
      } else {
        req.flash('error', i18next.t('flash.labels.delete.error'));
        reply.render('labels');
      }
    });
};
