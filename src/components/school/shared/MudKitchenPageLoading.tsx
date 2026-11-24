import GardenLoadingSplash from "@/components/school/shared/GardenLoadingSplash";

type MudKitchenPageLoadingProps = {
  label?: string;
};

export default function MudKitchenPageLoading({
  label = "Loading",
}: MudKitchenPageLoadingProps) {
  return <GardenLoadingSplash variant="page" label={label} />;
}
