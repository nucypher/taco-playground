import React from 'react';

export interface ComparatorSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ComparatorSelect: React.FC<ComparatorSelectProps> = ({ 
  value, 
  onChange,
  className = ''
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        px-2 py-1.5 text-sm 
        bg-black/30 text-white 
        border border-white/5 rounded
        focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20
        appearance-none
        bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%23FFFFFF%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-opacity%3D%220.3%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E")]
        bg-[length:1.25rem_1.25rem]
        bg-[right_0.25rem_center]
        bg-no-repeat
        pr-7
        transition-all duration-200
        hover:border-white/10 hover:bg-white/[0.06]
        ${className}
      `}
    >
      <option value=">=">&gt;=</option>
      <option value=">">&gt;</option>
      <option value="<=">&lt;=</option>
      <option value="<">&lt;</option>
      <option value="==">==</option>
    </select>
  );
}; 