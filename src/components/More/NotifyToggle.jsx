import React from 'react'

const NotifyToggle = ({ icon: Icon, label, description, value, onChange, color = "text-gray-600" }) => (
    <div className="flex items-start justify-between py-4 border-b border-gray-50 last:border-0 group">
        <div className="flex gap-4">
            <div className={`mt-1 p-2 rounded-lg bg-gray-50 ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <div className="pr-2">
                <p className="font-semibold text-gray-800 text-sm md:text-base">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
            </div>
        </div>
        <button
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none mt-2 ${value ? 'bg-indigo-600' : 'bg-gray-300'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
    </div>
);

export default NotifyToggle