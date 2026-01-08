import { ShieldAlert } from 'lucide-react';
import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 h-screen flex items-center justify-center p-9 bg-black/10 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ShieldAlert className="text-amber-400" size={24} />
                    <span>Thông báo</span>
                </h3>
                <p className="text-gray-600 mb-6">
                    {message || "Bạn có chắc chắn muốn thực hiện hành động này không?"}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;