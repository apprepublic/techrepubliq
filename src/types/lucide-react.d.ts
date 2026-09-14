declare module "lucide-react" {
  import { FC, SVGAttributes } from "react";
  interface IconProps extends SVGAttributes<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  }
  export const AlertCircle: FC<IconProps>;
  export const ArrowRight: FC<IconProps>;
  export const Bot: FC<IconProps>;
  export const Check: FC<IconProps>;
  export const CheckCircle: FC<IconProps>;
  export const CheckCircle2: FC<IconProps>;
  export const ChevronDown: FC<IconProps>;
  export const Clock: FC<IconProps>;
  export const Eye: FC<IconProps>;
  export const EyeOff: FC<IconProps>;
  export const Gauge: FC<IconProps>;
  export const Globe: FC<IconProps>;
  export const GraduationCap: FC<IconProps>;
  export const Loader2: FC<IconProps>;
  export const Menu: FC<IconProps>;
  export const Smartphone: FC<IconProps>;
  export const Sparkles: FC<IconProps>;
  export const X: FC<IconProps>;
  export const XCircle: FC<IconProps>;
}