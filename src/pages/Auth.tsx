import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mountain, Loader2 } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "@/contexts/AuthContext";
import { useContact } from "@/contexts/ContactContext";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signInWithGoogle } = useAuth();
  const { contactInfo } = useContact();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithGoogle(credentialResponse.credential || "");
      setSuccess("✅ Login Google berhasil! Mengalihkan...");
      setTimeout(() => navigate("/"), 500);
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || "Login Google gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔍 Check if running on Vercel or localhost (show Google Login everywhere)
  const isVercelOrLocal = window.location.hostname.includes('vercel.app') || 
                          window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1';
  
  const showGoogleLogin = isVercelOrLocal;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Home
        </Link>
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mountain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">KUALA OUTDOOR</h1>
          <p className="text-gray-600 font-medium">Penyewaan Alat Camping & Pendakian</p>
        </div>
        
        {/* Login Card */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
            <CardTitle className="text-white text-2xl font-bold">
              🏕️ Masuk ke Akun
            </CardTitle>
            <p className="text-green-50 mt-2">
              Masuk untuk melanjutkan rental equipment
            </p>
          </div>
          
          <CardContent className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <p className="text-red-700 text-sm font-medium">⚠️ {error}</p>
              </div>
            )}
            
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                <p className="text-green-700 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Google Login Section */}
            <div className="space-y-6">
              {showGoogleLogin ? (
                <>
                  <div className="text-center">
                    <p className="text-gray-600 mb-6 text-sm">
                      Gunakan akun Google Anda untuk masuk dengan cepat dan aman
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Memproses login...</span>
                      </div>
                    ) : (
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Login Google gagal. Silakan coba lagi.')}
                        useOneTap
                        size="large"
                        theme="outline"
                        text="continue_with"
                        shape="rectangular"
                      />
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-center text-sm text-gray-600">
                      <strong className="text-gray-900">Keuntungan Login:</strong>
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Akses cepat & mudah</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Riwayat booking tersimpan</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Proses rental lebih cepat</span>
                      </li>
                    </ul>
                  </div>
                </>
            ) : (
              <div className="p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                <p className="text-yellow-800 text-sm font-medium mb-2">
                  ⚠️ Google Login tidak tersedia
                </p>
                <p className="text-yellow-700 text-sm">
                  Gunakan domain <strong>vercel.app</strong> untuk Google OAuth.
                </p>
              </div>
            )}              {/* WhatsApp Alternative */}
              <div className="mt-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">atau</span>
                  </div>
                </div>
              </div>

              <a 
                href={`https://wa.me/${contactInfo.phone1.replace(/[^\d]/g, '')}?text=Halo%20Kuala%20Outdoor,%20saya%20ingin%20rental%20equipment`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg transition-all">
                  💬 Langsung Chat WhatsApp
                </Button>
              </a>
              
              <p className="text-center text-xs text-gray-500 mt-4">
                📞 {contactInfo.phone1} • {contactInfo.phone2}<br />
                <span className="text-green-600 font-medium">Melayani 24 jam (Fast Response)</span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Dengan masuk, Anda menyetujui{" "}
            <Link to="/about" className="text-green-600 hover:underline font-medium">
              Syarat & Ketentuan
            </Link>{" "}
            kami
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
