export const ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  STUDENT: 'student',
};

export const roleLabel = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return 'Admin';
    case ROLES.FACULTY:
      return 'Faculty';
    case ROLES.STUDENT:
      return 'Student';
    default:
      return role;
  }
};

