
import toast from 'react-hot-toast';

export const showSuccess = (message) => {
    toast.custom((t) => (
        <div
            role="alert"
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} w-full max-w-sm bg-green-100 dark:bg-green-900 border-l-4 border-green-500 dark:border-green-700 text-green-900 dark:text-green-100 p-2 rounded-lg flex items-center transition duration-300 ease-in-out hover:bg-green-200 dark:hover:bg-green-800 transform hover:scale-105 pointer-events-auto shadow-lg`}
        >
            <svg
                stroke="currentColor"
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 flex-shrink-0 mr-2 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                ></path>
            </svg>
            <p className="text-xs font-semibold">{message}</p>
        </div>
    ));
};

export const showInfo = (message) => {
    toast.custom((t) => (
        <div
            role="alert"
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} w-full max-w-sm bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 dark:border-blue-700 text-blue-900 dark:text-blue-100 p-2 rounded-lg flex items-center transition duration-300 ease-in-out hover:bg-blue-200 dark:hover:bg-blue-800 transform hover:scale-105 pointer-events-auto shadow-lg`}
        >
            <svg
                stroke="currentColor"
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 flex-shrink-0 mr-2 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                ></path>
            </svg>
            <p className="text-xs font-semibold">{message}</p>
        </div>
    ));
};

export const showWarning = (message) => {
    toast.custom((t) => (
        <div
            role="alert"
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} w-full max-w-sm bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 p-2 rounded-lg flex items-center transition duration-300 ease-in-out hover:bg-yellow-200 dark:hover:bg-yellow-800 transform hover:scale-105 pointer-events-auto shadow-lg`}
        >
            <svg
                stroke="currentColor"
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 flex-shrink-0 mr-2 text-yellow-600"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                ></path>
            </svg>
            <p className="text-xs font-semibold">{message}</p>
        </div>
    ));
};

export const showError = (message) => {
    toast.custom((t) => (
        <div
            role="alert"
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} w-full max-w-sm bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-700 text-red-900 dark:text-red-100 p-2 rounded-lg flex items-center transition duration-300 ease-in-out hover:bg-red-200 dark:hover:bg-red-800 transform hover:scale-105 pointer-events-auto shadow-lg`}
        >
            <svg
                stroke="currentColor"
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 flex-shrink-0 mr-2 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                ></path>
            </svg>
            <p className="text-xs font-semibold">{message}</p>
        </div>
    ));
};
