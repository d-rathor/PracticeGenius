const Joi = require('joi');

/**
 * Worksheet DSL Schema
 * Defines the structure for worksheet generation JSON
 */
const worksheetDslSchema = Joi.object({
  meta: Joi.object({
    id: Joi.string().optional(),
    seed: Joi.number().integer().optional(),
    grade: Joi.string().required(),
    subject: Joi.string().required(),
    title: Joi.string().required(),
  }).required(),
  
  instructions: Joi.string().required(),
  
  layout: Joi.object({
    type: Joi.string().valid('grid', 'list', 'columns', 'free').required(),
    rows: Joi.number().integer().min(1).when('type', {
      is: 'grid',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    cols: Joi.number().integer().min(1).when('type', {
      is: 'grid',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    show_answer_boxes: Joi.boolean().default(true),
    box_size: Joi.string().valid('small', 'medium', 'large').default('medium'),
    spacing: Joi.string().valid('tight', 'normal', 'spacious').default('normal'),
  }).required(),
  
  items: Joi.array().items(
    Joi.object({
      prompt: Joi.string().required(),
      target_answer: Joi.alternatives().try(
        Joi.string(),
        Joi.number(),
        Joi.array().items(Joi.string())
      ).required(),
      assets: Joi.array().items(
        Joi.object({
          type: Joi.string().valid('icon', 'image', 'shape', 'number', 'text').required(),
          name: Joi.string().required(),
          count: Joi.number().integer().min(1).max(20).optional(),
          color: Joi.string().optional(),
          size: Joi.string().valid('small', 'medium', 'large').optional(),
          arrangement: Joi.string().valid('row', 'grid', 'scattered', 'pattern').optional()
        })
      ).optional()
    })
  ).min(1).required(),
  
  answer_key: Joi.boolean().default(true),
  
  branding: Joi.object({
    logo: Joi.string().default('PracticeGenius'),
    theme: Joi.string().valid(
      'orange-white-black',
      'blue-white-gray',
      'green-white-black',
      'purple-white-gray'
    ).default('orange-white-black'),
    footer: Joi.string().optional()
  }).default({
    logo: 'PracticeGenius',
    theme: 'orange-white-black'
  })
});

module.exports = {
  worksheetDslSchema
};
