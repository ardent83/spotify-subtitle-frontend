export const inputClasses = "w-full bg-custom-gray-medium border border-custom-gray-medium rounded-md p-2 placeholder-custom-placeholder text-custom-primary focus:outline-none focus:ring-1 focus:ring-spotify-green hover:ring-1 hover:ring-spotify-green transition-all duration-200 ease-in-out";

export const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'var(--color-custom-gray-medium)',
    border: '1px solid var(--color-custom-gray-medium)',
    borderRadius: '0.375rem',
    boxShadow: state.isFocused ? '0 0 0 1px var(--color-spotify-green)' : 'none',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      borderColor: 'var(--color-spotify-green)',
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--color-custom-placeholder)',
    transition: 'color 0.2s ease',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--color-white)',
    transition: 'color 0.2s ease',
  }),
  input: (base) => ({
    ...base,
    color: 'var(--color-white)',
    transition: 'color 0.2s ease',
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--color-custom-gray-dark)',
    color: 'var(--color-white)',
    borderRadius: '0.375rem',
    zIndex: 100,
    animation: 'fadeIn 0.25s ease-in-out',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? 'var(--color-custom-gray)' : 'var(--color-custom-gray-dark)',
    color: state.isFocused ? 'var(--color-spotify-green)' : 'var(--color-white)',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    transition: 'all 0.2s ease',
  }),
};
