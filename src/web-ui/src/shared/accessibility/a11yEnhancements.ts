import { KeyboardEvent } from "react";

type InteractiveRowA11yArgs = {
  selected: boolean;
  label: string;
  onActivate: () => void;
};

export function getInteractiveRowA11yProps({ selected, label, onActivate }: InteractiveRowA11yArgs) {
  return {
    role: "button" as const,
    tabIndex: 0,
    "aria-selected": selected,
    "aria-label": label,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onActivate();
      }
    }
  };
}

export function buildPackageRowA11yLabel(packageName: string, version: string, isDirect: boolean) {
  return `${packageName} ${version}, ${isDirect ? "direct" : "indirect"} dependency`;
}
