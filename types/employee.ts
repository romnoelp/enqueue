import { AuthUser, EmployeeRole } from "./auth";

// Employee extends authenticated user with required fields we rely on in UI and APIs
interface Employee extends AuthUser {
  uid: string;
  name: string;
  role: EmployeeRole;
  email: string;
}

export default Employee;
