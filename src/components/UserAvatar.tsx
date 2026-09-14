import React, { useState } from 'react';
import { UserRole } from '../../packages/types/src/index';

export interface UserAvatarProps {
  avatar?: string | null;
  role?: UserRole | string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ROLE_DEFAULT_AVATARS: Record<string, string> = {
  STUDENT: '🎓',
  PARENT: '👨‍👩‍👧',
  TEACHER: '👨‍🏫',
  PRINCIPAL: '👨‍💼',
  SUPERVISOR: '📋',
  SCHOOL_ADMIN: '💻',
  SUPER_ADMIN: '🛡️',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  role = 'STUDENT',
  name = 'Pengguna',
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const fallbackEmoji = (role && ROLE_DEFAULT_AVATARS[role]) || '👤';

  const isUrl =
    typeof avatar === 'string' &&
    (avatar.startsWith('http://') ||
      avatar.startsWith('https://') ||
      avatar.startsWith('data:image/') ||
      avatar.startsWith('/') ||
      avatar.includes('.svg') ||
      avatar.includes('.png') ||
      avatar.includes('.jpg') ||
      avatar.includes('.webp'));

  // Size mappings
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-10 h-10 text-lg',
    xl: 'w-12 h-12 text-2xl',
  };

  const containerSize = sizeClasses[size] || sizeClasses.md;

  if (isUrl && !imageError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 border border-slate-200/80 bg-slate-100 shadow-2xs ${containerSize} ${className}`}
        title={`${name} (${role})`}
      >
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImageError(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Display emoji or role fallback
  const displayEmoji =
    avatar && !isUrl && avatar.trim().length > 0 ? avatar : fallbackEmoji;

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full shrink-0 border border-slate-200/80 bg-slate-50 select-none shadow-2xs ${containerSize} ${className}`}
      title={`${name} (${role})`}
    >
      <span className="leading-none flex items-center justify-center pointer-events-none">
        {displayEmoji}
      </span>
    </div>
  );
};
