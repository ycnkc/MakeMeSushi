import { useState } from 'react'

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isRegister, setIsRegister] = useState(false); // Kay?t m? Giri? mi?

    // Giri? yapmam?? kullan?c? için gösterilecek ekran
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-[#fdf6e3] flex items-center justify-center font-mono p-4">
                <div className="bg-[#fffcf5] border-2 border-[#e6dbbc] p-8 rounded-lg shadow-sm w-full max-w-md">
                    <h2 className="text-2xl text-[#5d4037] mb-6 text-center">
                        {isRegister ? 'JOIN THE BAR ??' : 'WELCOME BACK ??'}
                    </h2>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="USERNAME"
                            className="w-full p-3 bg-transparent border-b-2 border-[#e6dbbc] focus:border-[#5d4037] outline-none transition-colors"
                        />
                        <input
                            type="password"
                            placeholder="PASSWORD"
                            className="w-full p-3 bg-transparent border-b-2 border-[#e6dbbc] focus:border-[#5d4037] outline-none transition-colors"
                        />

                        <button
                            onClick={() => setIsLoggedIn(true)} // ?imdilik sahte giri?
                            className="w-full bg-[#5d4037] text-[#fdf6e3] py-3 mt-4 hover:bg-[#4e342e] transition-all"
                        >
                            {isRegister ? 'CREATE ACCOUNT' : 'LOGIN'}
                        </button>

                        <p className="text-center text-xs text-[#5d4037] opacity-60 mt-4 cursor-pointer"
                            onClick={() => setIsRegister(!isRegister)}>
                            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Giri? yapm?? kullan?c? Dashboard'u görür
    return (
        <div className="min-h-screen bg-[#fdf6e3] text-[#5d4037] font-mono flex flex-col items-center p-10">
            <h1 className="text-4xl mb-8">?? (Make Me Sushi)</h1>
            <div className="p-10 border-2 border-dashed border-[#e6dbbc]">
                Dashboard Loaded! Welcome to your sushi bar.
            </div>
        </div>
    );
}

export default App;