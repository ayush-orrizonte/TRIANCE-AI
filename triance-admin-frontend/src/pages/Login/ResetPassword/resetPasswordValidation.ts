import * as Yup from 'yup';

const resetPasswordValidation = {
    validateResetPassword: () => {
        return Yup.object().shape({
            // newPassword: Yup.string()
            //     .min(8, "Password must be at least 8 characters")
            //     .required("New password is required"),
            // confirmPassword: Yup.string()
            //     .oneOf([Yup.ref('newPassword'), ], "Passwords must match")
            //     .required("Confirm password is required"),
        });
    },
};

export default resetPasswordValidation;