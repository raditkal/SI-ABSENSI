// components/StatCard.tsx
interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    onClick?: () => void;
}

export const StatCard = ({ title, value, icon, color, onClick }: StatCardProps) => (
    <div
        onClick={onClick}
        className={`${color} p-8 rounded-[3rem] text-white flex flex-col justify-between cursor-pointer relative overflow-hidden group transition-all hover:-translate-y-2`}
    >
        <i className={`fas ${icon} absolute -right-4 -bottom-4 text-9xl opacity-10 group-hover:scale-110 transition-transform`}></i>
        <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{title}</p>
            <h3 className="text-6xl font-black mt-2">{value}</h3>
        </div>
        <div className="relative z-10 flex items-center gap-2 mt-8 text-[10px] font-bold bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
            LIHAT DATA <i className="fas fa-arrow-right"></i>
        </div>
    </div>
);