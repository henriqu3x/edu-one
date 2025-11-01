import * as React from 'react';
import {
  Book, Code, Laptop, Paintbrush, Music, Camera, Heart, Lightbulb,
  Brain, Languages, GraduationCap, Briefcase, Globe, Home, Smartphone,
  Gamepad2, Utensils, Dumbbell, Palette, Code2, Database, Server,
  Network, Lock, Shield, BarChart3, PieChart, LineChart, DollarSign,
  ShoppingCart, CreditCard, Wallet, Tag, Gift, Award, Star, MessageCircle,
  type LucideIcon
} from "lucide-react";

// Create a mapping of icon names to their corresponding components
export const iconComponents = {
  Book, Code, Laptop, Paintbrush, Music, Camera, Heart, Lightbulb,
  Brain, Languages, GraduationCap, Briefcase, Globe, Home, Smartphone,
  Gamepad2, Utensils, Dumbbell, Palette, Code2, Database, Server,
  Network, Lock, Shield, BarChart3, PieChart, LineChart, DollarSign,
  ShoppingCart, CreditCard, Wallet, Tag, Gift, Award, Star, MessageCircle
} as const;

// Type for valid icon names
type IconName = keyof typeof iconComponents;

// Map of icon names to their corresponding Lucide icon components
export const iconMap: Record<string, LucideIcon> = iconComponents;

// List of available icon names
export const categoryIcons = Object.keys(iconComponents) as IconName[];

// Default icon to use when an icon is not found
const DefaultIcon = Book;

// Component to render a category icon
interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  iconName, 
  className = "" 
}) => {
  const IconComponent = (iconName in iconComponents) 
    ? iconComponents[iconName as keyof typeof iconComponents] 
    : DefaultIcon;
  
  return React.createElement(IconComponent, { className });
};

// Function to get an icon component by name
export const getIconComponent = (iconName: string): LucideIcon => {
  return iconMap[iconName] || DefaultIcon;
};