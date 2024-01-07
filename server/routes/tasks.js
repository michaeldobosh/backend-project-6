/* eslint-disable no-param-reassign */
import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  app
    .get('/tasks', { name: 'tasks', preValidation: app.authenticate }, async (req, reply) => {
      const {
        label, executor, status, isCreatorUser,
      } = req.query;
      const userId = req.user.id;

      const tasksQuery = models.task.query().withGraphJoined('[creators, executors, statuses, labels]');

      if (executor) tasksQuery.modify('filterExecutor', executor);
      if (status) tasksQuery.modify('filterStatus', status);
      if (label) tasksQuery.modify('filterLabel', label);
      if (isCreatorUser) tasksQuery.modify('filterCreator', userId);

      const tasks = await tasksQuery;
      const users = await models.user.query();
      const labels = await models.label.query();
      const statuses = await models.status.query();

      reply.render('tasks/index', {
        tasks, statuses, users, labels, query: req.query,
      });

      return reply;
    })
    .get('/tasks/new', { name: 'newTasks', preValidation: app.authenticate }, async (req, reply) => {
      const task = new models.task();

      const statuses = await models.status.query();
      const users = await models.user.query();
      const labels = await models.label.query();
      reply.render('tasks/new', {
        task, statuses, users, labels,
      });

      return reply;
    })
    .post('/tasks', { name: 'createTask', preValidation: app.authenticate }, async (req, reply) => {
      const existingLabels = [req.body.data.labels].flat()
        .map((labelId) => ({ id: Number(labelId) }));
      const currentUser = req.user;
      const task = new models.task();
      const taskData = {
        ...req.body.data,
        name: req.body.data.name.trim(),
        statusId: Number(req.body.data.statusId),
        executorId: Number(req.body.data.executorId),
        creatorId: currentUser.id,
      };
      task.$set({ ...taskData, labels: existingLabels });

      const statuses = await models.status.query();
      const users = await models.user.query();
      const labels = await models.label.query();

      try {
        const validTaskData = await models.task.fromJson(taskData);
        await models.task.transaction(async (trx) => {
          const insertedTask = await models.task.query(trx)
            .insertGraph({ ...validTaskData, labels: existingLabels }, { relate: ['labels'] });
          return insertedTask;
        });
        req.flash('info', i18next.t('flash.tasks.create.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (error) {
        req.flash('error', i18next.t('flash.tasks.create.error'));
        reply.render('tasks/new', {
          task, statuses, users, labels, errors: error.data,
        });
      }
      return reply;
    })
    .get('/tasks/:id', { name: 'viewTasks', preValidation: app.authenticate }, async (req, reply) => {
      const taskId = Number(req.params.id);

      const task = await models.task.query().findById(taskId);
      const status = await models.status.query().findOne({ id: task.statusId });
      const creator = await models.user.query().findOne({ id: task.creatorId });
      const executor = await models.user.query().findOne({ id: task.executorId });
      const labels = await task.$relatedQuery('labels');

      reply.render('tasks/view', {
        task, status, creator, executor, labels,
      });

      return reply;
    })
    .get('/tasks/:id/edit', { name: 'editTasks', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;

      const task = await models.task.query().findOne({ id });
      const statuses = await models.status.query();
      const users = await models.user.query();
      const labels = await models.label.query();
      const selectedLabels = await task.$relatedQuery('labels');
      const selectedLabelsIds = selectedLabels.map((label) => label?.id);
      reply.render('tasks/edit', {
        task, statuses, users, labels, selectedLabelsIds,
      });

      return reply;
    })
    .patch('/tasks/:id', { name: 'updateTask', preValidation: app.authenticate }, async (req, reply) => {
      const taskId = Number(req.params.id);
      const selectedTask = await models.task.query().findById(taskId);
      const formData = new models.task().$set(req.body.data);
      const existingLabels = [req.body.data.labels].flat()
        .map((labelId) => ({ id: Number(labelId) }));
      const taskData = {
        ...formData,
        name: formData.name.trim(),
        creatorId: Number(selectedTask.creatorId),
        statusId: Number(formData.statusId),
        executorId: Number(formData.executorId),
      };
      const statuses = await models.status.query();
      const users = await models.user.query();
      const labels = await models.label.query();
      const selectedLabels = await models.task.relatedQuery('labels').for(selectedTask);
      const selectedLabelsIds = selectedLabels.map((label) => label?.id);

      try {
        const validTaskData = await models.task.fromJson(taskData);
        await models.task.transaction(async (trx) => {
          const updatedTask = await models.task.query(trx)
            .upsertGraph({ id: taskId, ...validTaskData, labels: existingLabels }, {
              relate: true, unrelate: true,
            });
          return updatedTask;
        });
        req.flash('info', i18next.t('flash.tasks.edit.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (error) {
        console.log(error.data);
        req.flash('error', i18next.t('flash.tasks.edit.error'));
        reply.render('tasks/edit', {
          task: { ...selectedTask, ...formData },
          statuses,
          users,
          labels,
          selectedLabelsIds,
          errors: error.data,
        });
      }
      return reply;
    })
    .delete('/tasks/:id', { name: 'deleteTask', preValidation: app.authenticate }, async (req, reply) => {
      const taskId = Number(req.params.id);
      const currentUser = req.user;
      const selectedTask = await models.task.query().findById(taskId);

      if (currentUser.id !== selectedTask.creatorId) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('tasks'));
        return reply;
      }

      try {
        await models.task.query().delete().where({ id: taskId });
        req.flash('info', i18next.t('flash.tasks.delete.success'));
        reply.redirect(app.reverse('tasks'));
      } catch (error) {
        req.flash('error', i18next.t('flash.tasks.delete.error'));
        reply.render('tasks');
      }
      return reply;
    });
};
