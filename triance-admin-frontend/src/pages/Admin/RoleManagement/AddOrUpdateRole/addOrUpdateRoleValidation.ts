import * as Yup from "yup";

const addOrUpdateRoleValidation = {
  validateAddOrUpdateRole: () => {
    return Yup.object().shape({
      role_name: Yup.string().trim().required("Role Name is required"),

      role_description: Yup.string()
        .trim()
        .required("Role Description is required")
        .min(3, "Role Description must be at least 3 characters")
        .max(200, "Role Description must not exceed 200 characters"),

      permissions: Yup.array().of(
        Yup.object().shape({
          menu_id: Yup.string().required(" Menu id required"),

          permission_id: Yup.string()

            .required("Permission id is required"),
        })
      ),
    });
  },
};

export default addOrUpdateRoleValidation;
