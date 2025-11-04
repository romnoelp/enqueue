import Employee from "@/types/employee";

const EmployeeCard = ({ name, role, email }: Employee) => {
  return (
    <div className=" w-full max-w-sm p-4">
      <div
        className="scale-in group visible cursor-pointer"
        style={{ transform: "translateY(0px) scale(1)" }}
      >
        <div
          className="relative transform overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 group-hover:scale-105 hover:shadow-xl"
          style={{
            background:
              "url(https://images.unsplash.com/photo-1635776062360-af423602aff3?w=800&amp;q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                data-lucide="code"
                className="lucide lucide-code h-6 w-6 text-white"
              >
                <path d="m16 18 6-6-6-6"></path>
                <path d="m8 6-6 6 6 6"></path>
              </svg>
            </div>
            <h3 className="mb-2 font-sans text-lg font-medium text-white">
              {name}
            </h3>
            <p className="mb-4 font-sans text-sm text-white/80">{role}</p>
            <div className="flex items-center text-white/60">
              <span className="font-sans text-xs">{email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
