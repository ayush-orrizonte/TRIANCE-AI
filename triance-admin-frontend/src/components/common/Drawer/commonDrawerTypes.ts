import { CSSProperties } from "react";

export interface CommonDrawerProps {
  opened: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
  position?: "left" | "right" | "top" | "bottom";
  closeButtonProps?: any;
  withCloseButton?: any;
  className?: string;
}
