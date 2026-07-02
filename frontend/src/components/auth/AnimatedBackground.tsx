export default function AnimatedBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0572ff]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#012340] rounded-full blur-3xl animate-pulse"></div>
        </div>
    );
}
