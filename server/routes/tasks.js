/* eslint-disable no-param-reassign */
import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  app
    .get('/tasks', { name: 'tasks' }, async (req, reply) => {
      const {
        label, executor, status, isCreatorUser,
      } = req.query;
      const userId = req.user?.id;

      if (req.isAuthenticated()) {
        const tasksQuery = models.task.query().withGraphJoined('[creators, executors, statuses, labels]');

        if (executor) tasksQuery.modify('filterExecutor', executor);
        if (status) tasksQuery.modify('filterStatus', status);
        if (label) tasksQuery.modify('filterLabel', label);
        if (isCreatorUser) tasksQuery.modify('filterCreator', userId);

        const tasks = await tasksQuery;
        const users = await models.user.query();
        const labels = await models.label.query();
        const statuses = await models.status.query();

        console.log(statuses);
        reply.render('tasks/index', {
          tasks, statuses, users, labels, query: req.query,
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
          task, statuses, users, labels,
        });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    })
    .post('/tasks', { name: 'createTask' }, async (req, reply) => {
      const labelsIds = [req.body.data.labels].flat();
      const existingLabels = await app.objection.models.label.query().findByIds(labelsIds);
      const currentUser = req.user;
      const formData = new models.task().$set(req.body.data);
      const taskData = {
        ...formData,
        statusId: Number(formData.statusId),
        executorId: !formData.executorId ? null : Number(formData.executorId),
        creatorId: currentUser.id,
        labels: existingLabels,
      };

      const statuses = await models.status.query();
      const users = await models.user.query();
      const labels = await models.label.query();

      try {
        if (req.isAuthenticated()) {
          const validTaskData = await models.task.fromJson(taskData);
          validTaskData.name = validTaskData.name.trim();
          await models.task.transaction(async (trx) => {
            const insertedTask = await models.task.query(trx)
              .insertGraph(validTaskData, { relate: ['labels'] });
            return insertedTask;
          });
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
          task: formData, statuses, users, labels, errors: error.data,
        });
      }
      return reply;
    })
    .get('/tasks/:id', { name: 'viewTasks' }, async (req, reply) => {
      const { id } = req.params;

      if (req.isAuthenticated()) {
        const task = await models.task.query().findById(id);
        const status = await models.status.query().findOne({ id: task.statusId });
        const creator = await models.user.query().findOne({ id: task.creatorId });
        const executor = await models.user.query().findOne({ id: task.executorId });
        const labels = await task.$relatedQuery('labels');

        reply.render('tasks/view', {
          task, status, creator, executor, labels,
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
        const selectedLabels = await task.$relatedQuery('labels');
        reply.render('tasks/edit', {
          task, statuses, users, labels, selectedLabels,
        });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    })
    .patch('/tasks/:id', async (req, reply) => {
      const taskId = Number(req.params.id);
      const selectedTask = await models.task.query().findById(taskId);
      const formData = new models.task().$set(req.body.data);
      const labelsIds = [req.body.data.labels].flat()
        .map((labelId) => ({ id: Number(labelId) }));
      const taskData = {
        ...formData,
        name: formData.name.trim(),
        creatorId: selectedTask.creatorId,
        statusId: Number(formData.statusId),
        executorId: !formData.executorId ? null : Number(formData.executorId),
      };

      const statuses = await models.status.query();
      const users = await models.user.query();
      const labels = await models.label.query();
      const selectedLabels = await models.task.relatedQuery('labels').for(selectedTask);

      try {
        if (req.isAuthenticated()) {
          const validTaskData = await models.task.fromJson(taskData);
          await models.task.transaction(async (trx) => {
            const updatedTask = await app.objection.models.task.query(trx)
              .upsertGraph({ id: taskId, ...validTaskData, labels: labelsIds }, {
                relate: true, unrelate: true,
              });
            return updatedTask;
          });
          req.flash('info', i18next.t('flash.tasks.edit.success'));
          reply.redirect(app.reverse('tasks'));
        } else {
          req.flash('error', i18next.t('flash.authError'));
          reply.redirect(app.reverse('root'));
        }
      } catch (error) {
        req.flash('error', i18next.t('flash.tasks.edit.error'));
        req.flash('error', error.message);
        reply.render('tasks/edit', {
          task: formData, statuses, users, labels, selectedLabels, errors: error.data,
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
      return reply;
    });
};
