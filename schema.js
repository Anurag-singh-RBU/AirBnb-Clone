const Joi = require("joi");

module.exports.LIST_SCHEMA = Joi.object({

    listing : Joi.object({

        title : Joi.string().required(),
        description : Joi.string().required(),
        price : Joi.number().required().min(0),
        image : Joi.string().allow("" , null),
        location : Joi.string().required(),
        country : Joi.string().required(),

    }).required()

})