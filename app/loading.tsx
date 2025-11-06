import BounceLoader from "@/components/mvpblocks/bouncing-loader";

export default function Loading() {
  return (
    <div className="h-full flex justify-center items-center">
      <BounceLoader />
    </div>
  );
}
