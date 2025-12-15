const Joi = require("joi");

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.alternatives().try(
            Joi.string().uri().allow("").optional(),
            Joi.object({
                url: Joi.string().uri().allow("").optional(),
                filename: Joi.string().allow("").optional()
            }).optional()
        ).optional(),
        image_url: Joi.string().uri().allow("").optional(),
        price: Joi.number().min(0).required(),
        country: Joi.string().required(),
        location: Joi.string().required()
    }).required()
});

module.exports = { listingSchema };

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required(),
    }).required(),
});