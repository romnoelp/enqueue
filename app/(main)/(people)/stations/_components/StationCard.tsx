import { Info, Mail } from "lucide-react";

const StationCard = () => {
  const Icon = Info;

  return (
    <div className="w-full max-w-sm h-50">
      <div className="scale-in group visible cursor-pointer h-full">
        <div
          className={`
            relative transform overflow-hidden rounded-2xl p-6 shadow-md
            transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg
            bg-card text-card-foreground border border-border h-full flex flex-col
          `}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-primary"></div>

          <div className="relative flex-1 flex flex-col justify-start">
            <div className="space-y-2 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>

              <h3
                className="font-sans font-semibold leading-tight"
                style={{ fontSize: "clamp(0.8rem, 2.5vw, 1.125rem)" }}
              >
                New Station
              </h3>

              <p
                className="text-sm text-muted-foreground capitalize"
                style={{ fontSize: "clamp(0.7rem, 2vw, 0.875rem)" }}
              >
                station
              </p>
            </div>

            <div className="h-px bg-border/50 my-2"></div>

            <div className="flex items-center text-muted-foreground overflow-hidden whitespace-nowrap">
              <Mail className="mr-2 h-4 w-4 text-primary/70 shrink-0" />
              <span
                className="text-left"
                style={{ fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)" }}
              >
                no counter assigned
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationCard;
