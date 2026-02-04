import React from 'react';

const SlideHandler = ({ onDrag }) => {
    return (
        <div
            className="w-1 bg-transparent hover:bg-green-500/50 cursor-col-resize transition-colors duration-200 relative group flex-shrink-0"
            onMouseDown={onDrag}
        >
            {/* Visual indicator on hover */}
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-green-500/20" />
        </div>
    );
};

export default SlideHandler;
