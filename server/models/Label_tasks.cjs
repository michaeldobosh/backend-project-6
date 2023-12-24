// @ts-check

const BaseModel = require('./BaseModel.cjs');
const objectionUnique = require('objection-unique');

const unique = objectionUnique({ fields: ['id'] });

module.exports = class LabelTasks extends unique(BaseModel) {
  static get tableName() {
    return 'label_tasks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [],
      properties: {
        id: { type: 'integer' },
        labelId: { type: 'integer' },
        taskId: { type: 'integer' },
      },
    };
  }
};