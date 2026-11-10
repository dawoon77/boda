import React from 'react';
import { KBOTeam } from '../types';
import { getTeamById } from '../data/kboData';

interface TeamLogoProps {
  team?: KBOTeam | null;
  teamId?: string;
  className?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_MAP = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-11 h-11',
};

export function TeamLogo({ team, teamId, className, alt, size }: TeamLogoProps) {
  const target = team || (teamId ? getTeamById(teamId) : null);
  if (!target) return <span className="inline-block">⚾</span>;

  const url = target.logoUrl || target.logoEmoji;
  const sizeClass = size ? SIZE_MAP[size] : (className || 'w-5 h-5');

  if (url && (url.startsWith('/') || url.startsWith('http') || url.includes('.'))) {
    return (
      <img
        src={url}
        alt={alt || target.name || '팀 마스코트'}
        className={`inline-block object-contain shrink-0 drop-shadow-2xs ${sizeClass} ${size && className ? className : ''}`}
        loading="lazy"
        draggable={false}
      />
    );
  }

  return <span className={`inline-block ${sizeClass}`}>{url || '⚾'}</span>;
}

export default TeamLogo;
