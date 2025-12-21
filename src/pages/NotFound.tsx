import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Leaf } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-green-100 opacity-30 blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-100 opacity-30 blur-3xl" />
      </div>

      <div className="max-w-md w-full px-4 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-800 mb-2">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Oops! The page you are looking for has vanished into the digital wilderness.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-green-600 hover:bg-green-700 h-11 px-8 text-base shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Return Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 px-8 text-base border-gray-300 hover:bg-gray-50 hover:text-green-700 transition-all duration-300"
              onClick={() => window.history.back()}
            >
              <button className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </Button>
          </div>
        </div>

        {/* Helper Links Card */}
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-gray-500">
              Looking for something specific? Check our <Link to="/membership" className="text-green-600 hover:underline font-medium">Membership</Link> options or <Link to="/contact" className="text-green-600 hover:underline font-medium">Contact Us</Link> for help.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
