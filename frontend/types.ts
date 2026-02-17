import React from 'react';

export interface NavItem {
  id: string;
  label: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

export interface TerminalLine {
  text: string;
  type: 'output' | 'input' | 'error' | 'success';
  delay?: number;
}