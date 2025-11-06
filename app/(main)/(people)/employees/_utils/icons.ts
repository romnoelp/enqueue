import { Crown, Shield, DollarSign, Info } from "lucide-react";

const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  superAdmin: Crown,
  admin: Shield,
  cashier: DollarSign,
  information: Info,
};

export default ROLE_ICONS;
