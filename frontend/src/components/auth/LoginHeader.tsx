import logo from '@/components/assets/LogoType/Aissential Logotype Assets_Logotype 2.svg'

export default function LoginHeader() {
    return (
        <div className="text-center mb-6">
            <div className="mb-4 flex justify-center">
                <img src={logo} alt="aissentialLogo" className='h-8 w-auto'/>

            </div>
            <p className="text-white/40 text-sm">Admin Dashboard</p>
            <div className="w-12 h-1 bg-gradient-to-r from-[#0572ff] to-[#012340] mx-auto mtlogin-4 rounded-full"></div>
        </div>
    );
}
