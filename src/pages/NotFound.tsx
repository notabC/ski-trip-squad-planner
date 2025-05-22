import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Mountain, Snowflake, ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50 p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-xl shadow-slate-200/50 rounded-xl overflow-hidden">
        <div className="p-8 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 opacity-20 blur-md animate-pulse"></div>
            <div className="p-4 bg-gradient-to-br from-sky-400/20 to-blue-600/20 rounded-full relative">
              <MapPin className="h-12 w-12 text-sky-600" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">Lost on the Slopes</h2>
            <p className="text-slate-600 mb-4">
              Oops! Looks like you've skied off the trail. The page you're looking for doesn't exist.
            </p>
            <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500 mb-6">
              <Snowflake className="h-3 w-3 text-sky-500 animate-pulse" />
              <span>Attempted path: {location.pathname}</span>
              <Snowflake className="h-3 w-3 text-sky-500 animate-pulse" />
            </div>
          </div>
          
          <Link to="/">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home Base
            </Button>
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-sky-50 to-blue-50/50 p-4 border-t border-slate-100 flex items-center justify-center gap-2">
          <Mountain className="h-4 w-4 text-sky-600" />
          <span className="text-sm text-slate-600">Ski Trip Planner</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
