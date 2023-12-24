import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const tasks = await models.task.query();
      const statuses = await models.status.query();
      const users = await models.user.query();
      const labels = await models.label.query();

      if (req.isAuthenticated()) {
        reply.render('tasks/index', {
          tasks,
          statuses,
          users,
          labels,
        });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    })
    .get('/tasks/new', { name: 'newTasks' }, async (req, reply) => {
      const task = new models.task();

      if (req.isAuthenticated()) {
        const statuses = await models.status.query();
        const users = await models.user.query();
        const labels = await models.label.query();
        reply.render('tasks/new', {
          task,
          statuses,
          users,
          labels,
        });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    })
    .post('/tasks', { name: 'createTask' }, async (req, reply) => {
      const currentUser = req.user;
      const task = new models.task();
      task.$set(req.body.data);
      task.statusId = +task.statusId;
      task.executorId = +task.executorId;
      task.creatorId = currentUser.id;
      const statuses = await models.status.query();
      const users = await models.user.query();
      const labels = await models.label.query();

      try {
        if (req.isAuthenticated()) {
          const validTask = await models.task.fromJson(task);
          validTask.name = validTask.name.trim();
          await models.task.query().insert(validTask);
          req.flash('info', i18next.t('flash.tasks.create.success'));
          reply.redirect(app.reverse('tasks'));
        } else {
          req.flash('error', i18next.t('flash.authError'));
          reply.redirect(app.reverse('root'));
        }
      } catch (error) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        req.flash('error', error.message);
        reply.render('tasks/new', {
          task,
          statuses,
          users,
          labels,
          errors: error.data,
        });
      }
      return reply;
    })
    .get('/tasks/:id', { name: 'viewTasks' }, async (req, reply) => {
      const { id } = req.params;

      if (req.isAuthenticated()) {
        const task = await models.task.query().findOne({ id });
        const labels = await models.labelTasks.query();
        const status = await models.status.query().findOne({ id: task.statusId });
        const creator = await models.user.query().findOne({ id: task.creatorId });
        const executor = await models.user.query().findOne({ id: task.executorId });

        reply.render('tasks/view', {
          task,
          status,
          creator,
          executor,
          labels,
        });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    })
    .get('/tasks/:id/edit', { name: 'editTasks' }, async (req, reply) => {
      const { id } = req.params;

      if (req.isAuthenticated()) {
        const task = await models.task.query().findOne({ id });
        const statuses = await models.status.query();
        const users = await models.user.query();
        const labels = await models.label.query();
        reply.render('tasks/edit', {
          task,
          statuses,
          users,
          labels,
        });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    })
    .patch('/tasks/:id', async (req, reply) => {
      const { id } = req.params;
      const selectedTask = await models.task.query().findOne({ id });
      const task = new models.task();
      task.$set(req.body.data);
      task.statusId = +task.statusId;
      task.executorId = +task.executorId;
      task.creatorId = selectedTask.creatorId;
      task.labelId = +task.creatorId;
      const statuses = await models.status.query();
      const users = await models.user.query();
      const labels = await models.label.query();

      try {
        if (req.isAuthenticated()) {
          const validTask = await models.task.fromJson(task);
          await selectedTask.$query().patch(validTask);
          req.flash('info', i18next.t('flash.tasks.edit.success'));
          reply.redirect(app.reverse('tasks'));
        } else {
          req.flash('error', i18next.t('flash.authError'));
          reply.redirect(app.reverse('root'));
        }
      } catch (error) {
        req.flash('error', i18next.t('flash.tasks.edit.error'));
        reply.render('tasks/edit', {
          task,
          statuses,
          users,
          labels,
          errors: error.data,
        });
      }
      return reply;
    })
    .delete('/tasks/:id', { name: 'deleteTask' }, async (req, reply) => {
      const { id } = req.params;
      const currentUser = req.user;
      const selectedTask = await models.task.query().findOne({ id });

      if (!req.isAuthenticated() || currentUser.id !== selectedTask.creatorId) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }

      try {
        await models.task.query().delete().where({ id });
        req.flash('info', i18next.t('flash.tasks.delete.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (error) {
        req.flash('error', i18next.t('flash.tasks.delete.error'));
        reply.render('tasks');
      }
    });
};
