// @ts-check

const BaseModel = require('./BaseModel.cjs');
const User = require('./User.cjs');
const Status = require('./Status.cjs');
const Label = require('./Label.cjs');
const objectionUnique = require('objection-unique');

const unique = objectionUnique({ fields: ['name'] });

module.exports = class Task extends unique(BaseModel) {
  static get tableName() {
    return 'tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId', 'creatorId'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1 },
        description: { type: 'string' },
        statusId: { type: 'integer' },
        creatorId: { type: 'integer' },
        executorId: { type: 'integer' },
      },
    };
  }

  static relationMappings = {
    creators: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'tasks.creatorId',
        to: 'users.id',
      },
    },
    executors: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'tasks.executorId',
        to: 'users.id',
      },
    },
    statuses: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: Status,
      join: {
        from: 'tasks.statusId',
        to: 'statuses.id',
      },
    },
    labels: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: Label,
      join: {
        from: 'tasks.id',
        through: {
          from: 'label_tasks.taskId',
          to: 'label_tasks.labelId',
        },
        to: 'labels.id',
      },
    },
  };
};
