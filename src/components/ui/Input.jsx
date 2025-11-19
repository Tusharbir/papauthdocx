import { useState, forwardRef } from 'react';
import cn from '../../utils/cn';

/**
 * Input component with Material UI-like validation behavior
 * Shows validation errors only after field is touched (onBlur or onChange)
 */
const Input = forwardRef(({ 
  label,
  required = false,
  error,
  helperText,
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  const [touched, setTouched] = useState(false);
  const showError = touched && (error || (required && !props.value));
  const errorMessage = error || (required && !props.value ? `${label || 'This field'} is required` : '');

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <label className="text-sm font-semibold">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <input
        ref={ref}
        required={required}
        className={cn(
          'w-full rounded-2xl border bg-white/5 px-4 py-3 text-sm transition-colors',
          showError
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
            : 'border-white/10 focus:border-blue-400 focus:ring-blue-400',
          props.readOnly && 'cursor-not-allowed opacity-70',
          className
        )}
        onBlur={(e) => {
          setTouched(true);
          props.onBlur?.(e);
        }}
        onChange={(e) => {
          if (!touched) setTouched(true);
          props.onChange?.(e);
        }}
        {...props}
      />
      {showError && errorMessage && (
        <p className="text-xs text-rose-400">{errorMessage}</p>
      )}
      {!showError && helperText && (
        <p className="text-xs text-slate-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
