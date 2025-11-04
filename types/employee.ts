import { UserRole } from "./auth";

interface Employee {
  uid?: string;
  name: string;
  role: UserRole;
  email: string;
}

export default Employee;
