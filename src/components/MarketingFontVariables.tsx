import { lora, poppins } from "@/lib/fonts";

type MarketingFontVariablesProps = {
  children: React.ReactNode;
};

export default function MarketingFontVariables({
  children,
}: MarketingFontVariablesProps) {
  return (
    <div className={`${lora.variable} ${poppins.variable} contents`}>
      {children}
    </div>
  );
}
