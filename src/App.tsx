import AppRoutes from './Routers/AppRoutes'
import Navbar from './Components/NavComp/Navbar'
import Footer from './Components/FooterComp/Footer'
import { HashRouter, useLocation } from 'react-router-dom'
import { useState, useEffect, ReactNode } from 'react'

const PageLoader = ({ children }: { children: ReactNode }) => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500); // 500ms smooth loading delay
        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <div className="relative">
            {isLoading && (
                <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-md z-[9999] flex flex-col items-center justify-center text-white">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <span className="text-6xl text-gold-500 font-bold select-none animate-pulse">✦</span>
                        <h2 className="text-2xl font-bold tracking-widest text-white uppercase font-display">Grand Azure</h2>
                        <div className="w-24 h-0.5 bg-gold-500/20 mt-2 rounded-full overflow-hidden relative">
                            <div className="absolute top-0 left-0 h-full bg-gold-500 w-1/2 rounded-full animate-shimmer" />
                        </div>
                    </div>
                </div>
            )}
            <div className={isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-300"}>
                {children}
            </div>
        </div>
    );
};

const AppContent = () => {
  return (
    <>
      <Navbar />
      <PageLoader>
        <AppRoutes />
      </PageLoader>
      <Footer />
    </>
  )
}

const App = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  )
}

export default App