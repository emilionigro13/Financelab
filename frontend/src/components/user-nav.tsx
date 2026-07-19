'use client';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export function UserNav() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
      <Button variant="outline" size="sm" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}