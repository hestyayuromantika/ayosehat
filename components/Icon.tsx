import React from 'react';
import { Activity, CreditCard, Users, Calendar, Network, Stethoscope, FileText, Settings, Send, User } from 'lucide-react';

export const IconMap: Record<string, React.ElementType> = {
  Activity,
  CreditCard,
  Users,
  Calendar,
  Network,
  Stethoscope,
  FileText,
  Settings,
  Send,
  User
};

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className, size = 20 }) => {
  const IconComponent = IconMap[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} size={size} />;
};