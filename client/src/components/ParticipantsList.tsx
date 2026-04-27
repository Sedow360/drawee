import type { Participant } from '../types';

interface Props {
  participants: Participant[];
  dark: boolean;
}

export default function ParticipantsList({participants, dark}: Props) {
    const TOOL_EMOJIS: Record<string, string> = {draw: '✏️', erase: '🧹'};
    return (
        <div className={`w-full border-b py-1.5 shadow-xl transition-colors duration-200
            ${!dark ? 'bg-white border-slate-200' : 'bg-black border-white/10'}`}>
            
            {participants.length === 0 && (
            <p className={`px-3 py-1.5 text-xs ${!dark ? 'text-slate-400' : 'text-white/30'}`}>
                No participants
            </p>
            )}

            {participants.map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                <span 
                className="text-sm truncate flex-1 font-medium" 
                style={{ color: p.color ? p.color :  `${dark ? '#ffffff' : '#000000'}`}}
                >
                {p.username}
                </span>
                
                <span className={`text-xs ${!dark ? 'opacity-80' : 'opacity-100'}`}>
                {TOOL_EMOJIS[p.tool] || '🤔'}
                </span>
            </div>
            ))}
        </div>
        );

}