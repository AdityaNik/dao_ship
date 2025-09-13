
import React from "react";
import { cn } from "@/lib/utils";

interface GlassmorphicSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  className?: string;
}

const GlassmorphicSlider = ({
  label,
  min,
  max,
  value,
  onChange,
  unit = "",
  className,
  ...props
}: GlassmorphicSliderProps) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm text-white/70">{label}</label>
        <span className="text-sm text-white">{value}{unit}</span>
      </div>
      <div className="relative h-14 glass-input rounded-lg flex items-center px-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #6E44FF 0%, #6E44FF ${((value - min) * 100) / (max - min)}%, rgba(255, 255, 255, 0.1) ${((value - min) * 100) / (max - min)}%, rgba(255, 255, 255, 0.1) 100%)`,
          }}
          {...props}
        />
      </div>
    </div>
  );
};

export default GlassmorphicSlider;
