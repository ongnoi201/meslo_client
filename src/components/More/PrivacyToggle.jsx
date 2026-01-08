import React from 'react'

const PrivacyToggle = ({ label, description, value, onChange }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
        <div className="pr-4">
            <p className="font-semibold text-gray-800 text-sm md:text-base">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <button
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${value ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    </div>
);

export default PrivacyToggle