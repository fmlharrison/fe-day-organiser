"use client";

type GoogleButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
};

export function GoogleButton({ onClick, disabled }: GoogleButtonProps) {
  return (
    <button
      type="button"
      className="gbtn"
      onClick={onClick}
      disabled={disabled}
    >
      <svg className="gicon" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.5 2.4 30.1 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.9 6.2C12.3 13.2 17.7 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.8-9.9 6.8-17.4z"
        />
        <path
          fill="#FBBC05"
          d="M10.4 28.5c-.5-1.4-.8-3-.8-4.5s.3-3.1.8-4.5l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.9-6.2z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.1 0 11.3-2 15-5.5l-7.3-5.7c-2 1.4-4.7 2.3-7.7 2.3-6.3 0-11.7-3.7-13.6-9.1l-7.9 6.2C6.4 42.6 14.6 48 24 48z"
        />
      </svg>
      Sign in with Google
    </button>
  );
}
