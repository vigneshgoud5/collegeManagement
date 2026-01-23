import { useState } from 'react';

interface PasswordInputProps {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  labelClassName?: string;
}

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = 'Enter your password',
  required = false,
  minLength,
  className = 'form-control',
  style,
  label,
  labelClassName = 'form-label',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {label && (
        <label className={labelClassName} htmlFor={id} style={{ display: 'block', marginBottom: '0.5rem' }}>
          {label}
        </label>
      )}
      <div className="password-input-wrapper">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className={className}
          style={{
            ...style,
            paddingRight: '40px',
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="password-toggle-btn"
          tabIndex={-1}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <span style={{ fontSize: '18px' }}>👁️</span>
          ) : (
            <span style={{ fontSize: '18px' }}>👁️‍🗨️</span>
          )}
        </button>
      </div>
    </div>
  );
}

