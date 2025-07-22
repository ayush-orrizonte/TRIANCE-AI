import Joi from "joi";
import { IMenu } from "../../types/custom";
import { MenuStatus } from "../../enums/status";

const menusValidations = {
    validateCreateMenu: (menu: IMenu): Joi.ValidationResult => {
        const menuSchema = Joi.object({
            menu_id: Joi.number().optional(),
            menu_name: Joi.string().min(3).max(30).required(),
            menu_description: Joi.string().min(3).max(50).required(),
            status: Joi.number().valid(...Object.values(MenuStatus).filter(value => typeof value === 'number')),
            menu_order: Joi.number().optional(),
            route_url: Joi.string().min(3).max(30).optional(),
            icon_class: Joi.string().allow("", null).optional(),
            date_created: Joi.string().allow("", null).optional(),
            date_updated: Joi.string().allow("", null).optional()
        });
        return menuSchema.validate(menu);
    },
    validateUpdateMenu: (menu: Partial<IMenu>): Joi.ValidationResult => {
        const menuSchema = Joi.object({
            menu_id: Joi.number().required(),
            menu_name: Joi.string().min(3).max(30).required(),
            menu_description: Joi.string().min(3).max(50).required(),
            status: Joi.number().valid(...Object.values(MenuStatus).filter(value => typeof value === 'number')),
            menu_order: Joi.number().optional(),
            route_url: Joi.string().min(3).max(30).optional(),
            icon_class: Joi.string().allow("", null).optional(),
            date_created: Joi.string().allow("", null).optional(),
            date_updated: Joi.string().allow("", null).optional()
        });
        return menuSchema.validate(menu);
    },
    validateUpdateMenuStatus: (menu: IMenu): Joi.ValidationResult => {
        const menuSchema = Joi.object({
            menuId: Joi.number().required(),
            status: Joi.number().valid(...Object.values(MenuStatus).filter(value => typeof value === 'number')).required()
        });
        return menuSchema.validate(menu);
    }
   
}

export default menusValidations;