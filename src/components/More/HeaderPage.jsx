import { ChevronLeft } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function HeaderPage({title}) {
    const navigate = useNavigate();
    return (
        <div className="sticky top-0 z-30 bg-white flex items-center p-2 border-b border-gray-100">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition"><ChevronLeft size={24} /></button>
            <h2 className="ml-2 text-lg font-bold text-gray-800 truncate">{title}</h2>
        </div>
    )
}

export default HeaderPage