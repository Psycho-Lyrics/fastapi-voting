import React from 'react';
import Button, {ToggleButton} from '../Button';
import { PiBooksLight } from "react-icons/pi";
import { LiaFireAltSolid } from "react-icons/lia";

const VotingControls = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex flex-wrap gap-2 md:gap-4 justify-center sm:justify-start">
            <ToggleButton className={`${activeTab === 'active' ? 'bg-[#5BC25B] text-white shadow-lg' : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'}`}
                onClick={() => onTabChange('active')}>
                <LiaFireAltSolid size={24} />
                Активные голосования
            </ToggleButton>

            <ToggleButton className={`${activeTab === 'archived' ? 'bg-[#5BC25B] text-white shadow-lg' : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'}`}
                onClick={() => onTabChange('archived')}>
                <PiBooksLight size={24} />
                Архивные голосования
            </ToggleButton>
        </div>
    );
};

export default VotingControls;