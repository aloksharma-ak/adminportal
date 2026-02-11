"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  color?: string;
}

export function ToggleControl({
  label,
  checked,
  onChange,
  disabled,
  color,
}: Props) {
  const id = React.useId();
  return (
    <div className="flex items-center gap-2">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        style={
          checked && color
            ? { backgroundColor: color }
            : { backgroundClip: "#000" }
        }
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
}
