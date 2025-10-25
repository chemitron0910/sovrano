import React from 'react';
import { Text } from 'react-native';
import { JSX } from 'react/jsx-runtime';
import { useUserRole } from '../hooks/useUserRole';

export const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const role = useUserRole();
  if (!role || !allowedRoles.includes(role)) return <Text>Access Denied</Text>;
  return children;
};
