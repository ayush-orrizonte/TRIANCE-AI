import * as Yup from "yup";

export const profileValidation = {
  validateProfile: () => {
    return Yup.object().shape({
      firstName: Yup.string().required("Please enter first name"),
      lastName: Yup.string().optional(),
      emailId: Yup.string().required("Please enter email id"),
      dob: Yup.date().required("Please select date of birth"),
    });
  },
};

export default profileValidation;
