import React from 'react';
import { Layers, Plus, FileSpreadsheet } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'layers' | 'plus' | 'spreadsheet';
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'layers',
  title,
  description,
  actionText,
  onAction,
}) => {
  const icons = {
    layers: <Layers className="w-10 h-10 text-slate-400 dark:text-slate-500 stroke-[1.5]" />,
    plus: <Plus className="w-10 h-10 text-slate-400 dark:text-slate-500 stroke-[1.5]" />,
    spreadsheet: <FileSpreadsheet className="w-10 h-10 text-slate-400 dark:text-slate-500 stroke-[1.5]" />,
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
        {icons[icon]}
      </div>
      <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-blue-600 rounded-lg hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};
