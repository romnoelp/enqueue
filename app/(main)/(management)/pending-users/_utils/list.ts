import type Employee from "@/types/employee";

export const removePendingUser = (list: Employee[], target: Employee): Employee[] => {
  const { uid, email } = target;

  return list.filter((user) => {
    if (uid && user.uid) {
      return user.uid !== uid;
    }
    if (email) {
      return user.email !== email;
    }
    return user !== target;
  });
};
