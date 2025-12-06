import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Mountain, User, Mail, Lock, Phone, Loader2 } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // Validasi login
        if (!formData.email || !formData.password) {
          setError("Email dan password wajib diisi.");
          setIsLoading(false);
          return;
        }
        
        await signIn(formData.email, formData.password);
        setSuccess("Login berhasil! Mengalihkan...");
        setTimeout(() => navigate("/"), 500);
      } else {
        // Validasi registrasi
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone) {
          setError("Semua field wajib diisi.");
          setIsLoading(false);
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          setError("Password dan konfirmasi password tidak cocok.");
          setIsLoading(false);
          return;
        }
        
        if (formData.password.length < 6) {
          setError("Password minimal 6 karakter.");
          setIsLoading(false);
          return;
        }
        
        if (!/[A-Z]/.test(formData.password)) {
          setError("Password harus mengandung minimal 1 huruf besar.");
          setIsLoading(false);
          return;
        }
        
        if (!/[0-9]/.test(formData.password)) {
          setError("Password harus mengandung minimal 1 angka.");
          setIsLoading(false);
          return;
        }

        await signUp(formData.name, formData.email, formData.password, formData.phone);
        setSuccess("✅ Registrasi berhasil! Silakan login.");
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: ""
        });
        
        setTimeout(() => {
          setIsLogin(true);
          setSuccess("");
        }, 2000);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error saat user mulai mengetik
    if (error) setError("");
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithGoogle(credentialResponse.credential || "");
      setSuccess("Login Google berhasil! Mengalihkan...");
      setTimeout(() => navigate("/"), 500);
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || "Login Google gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Home
        </Link>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mountain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">KUALA OUTDOOR</h1>
          <p className="text-gray-600">Penyewaan Alat Camping & Pendakian</p>
        </div>
        
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? "🔐 Masuk ke Akun" : "📝 Daftar Akun Baru"}
            </CardTitle>
            <p className="text-center text-gray-600 text-sm">
              {isLogin ? "Masuk untuk melanjutkan rental equipment" : "Buat akun untuk mulai rental equipment"}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    <User className="h-4 w-4 inline mr-2" />
                    Nama Lengkap
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="h-11"
                    disabled={isLoading}
                  />
                </div>
              )}
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Nomor Telepon
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="h-11"
                    disabled={isLoading}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-11"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Password {!isLogin && <span className="text-xs text-gray-500">(min. 6 karakter, 1 huruf besar, 1 angka)</span>}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-11 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    <Lock className="h-4 w-4 inline mr-2" />
                    Konfirmasi Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Ulangi password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="h-11"
                    disabled={isLoading}
                  />
                </div>
              )}
              
              {isLogin && (
                <div className="text-right">
                  <a 
                    href="https://wa.me/6289692854470?text=Halo,%20saya%20lupa%20password"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Lupa password?
                  </a>
                </div>
              )}
              
              {/* ERROR MESSAGE */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}
              
              {/* SUCCESS MESSAGE */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isLogin ? "Masuk..." : "Mendaftar..."}
                  </>
                ) : (
                  isLogin ? "🔐 Masuk" : "📝 Daftar"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                    setSuccess("");
                    setFormData({
                      name: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      phone: ""
                    });
                  }}
                  className="ml-2 text-green-600 hover:text-green-700 font-medium"
                  disabled={isLoading}
                >
                  {isLogin ? "Daftar di sini" : "Masuk di sini"}
                </button>
              </p>
            </div>
            
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">atau</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            
            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Login Google gagal. Silakan coba lagi.')}
                useOneTap
              />
            </div>
            
            <div className="space-y-3">
              <a 
                href="https://wa.me/6289692854470?text=Halo%20Kuala%20Outdoor,%20saya%20ingin%20rental%20equipment"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full h-11 border-green-600 text-green-600 hover:bg-green-50">
                  💬 Langsung Chat WhatsApp
                </Button>
              </a>
              <p className="text-center text-xs text-gray-500">
                📞 089692854470 • 082253446316<br />
                Melayani 24 jam (Fast Response)
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Dengan mendaftar, Anda menyetujui{" "}
            <Link to="/about" className="text-green-600 hover:underline">
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