import React from 'react';
import { RiArrowRightSFill } from "react-icons/ri";
import { RiArrowLeftSFill } from "react-icons/ri";


const PaginationControls = ({currentPage, totalPages, hasNext, hasPrev, onNextPage, onPrevPage}) => {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex gap-2 items-center rounded-lg border border-[#CCCCCC] px-3 py-2 w-full sm:w-auto">
                <div className="text-neutral-800 text-sm sm:text-base font-normal whitespace-nowrap">
                    {currentPage} из {totalPages}
                </div>
                <div className="flex items-center">
                    <button
                        onClick={onPrevPage}
                        disabled={!hasPrev}
                        className={`rounded-lg flex items-center justify-center cursor-pointer ${!hasPrev ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <RiArrowLeftSFill size={24} />
                    </button>
    
                    <button
                        onClick={onNextPage}
                        disabled={!hasNext}
                        className={`rounded-lg flex items-center justify-center cursor-pointer ${!hasNext ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <RiArrowRightSFill size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaginationControls;