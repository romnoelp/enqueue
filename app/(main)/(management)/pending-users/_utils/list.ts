import type Employee from "@/types/employee";

// Remove user from pending list by uid or email
const removePendingUser = (pendingUsers: Employee[], targetUser: Employee): Employee[] => {
  const { uid, email } = targetUser;

  return pendingUsers.filter((user) => {
    if (uid && user.uid) {
      return user.uid !== uid;
    }
    if (email) {
      return user.email !== email;
    }
    return user !== targetUser;
  });
};

export { removePendingUser };


