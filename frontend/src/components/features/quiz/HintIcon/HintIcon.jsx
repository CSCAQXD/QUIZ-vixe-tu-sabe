function HintIcon({ className = "" }) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="none"
            viewBox="0 0 50 63"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M26.07 19.05c8.14 0 14.76 6.44 15 14.48v.46c0 2.05-.41 4.01-1.16 5.79-.37.68-4.25 6.88-5.4 8.71-.8 1.28-1.8 3.23-2.42 6H19.33c-.31-1.36-.75-2.88-1.38-4.51l-.31-.77c-1.36-3.26-3.05-5.78-4.49-7.59-.49-.98-.84-1.67-.93-1.84a14.85 14.85 0 0 1-1.17-5.79c0-8.25 6.72-14.94 15.02-14.94Z"
                fill="currentColor"
                stroke="currentColor"
            />
            <path d="M19.71 56.77h11.92c.22 0 .39.18.39.39v.69c0 .21-.17.39-.39.39H19.71a.39.39 0 0 1-.39-.39v-.69c0-.22.17-.39.39-.39ZM29.39 60.17c-.14.46-.47.89-.97 1.24-.69.49-1.66.81-2.75.81s-2.06-.32-2.74-.81c-.51-.35-.84-.78-.98-1.24h7.44Z" fill="currentColor" stroke="currentColor" />
            <path d="m10.04 21.67-8.99-4.57M18.29 15.51 11.56 5.07M27.08 14.28 26.69 1.05M35.96 15.53 42.41 5.07M40.75 21.67l8.12-4.57" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default HintIcon;
