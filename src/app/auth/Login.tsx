import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import { useAuthStore } from '@/hooks/auth';
import { tenantLogin } from '@/service/tenant.service';
import axios from 'axios';
import { loginSchema } from '@/schemas';

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues): Promise<void> => {
    setServerError(null);
    try {
      const res = await tenantLogin(data.email, data.password);
      const payload = JSON.parse(atob(res.access_token.split('.')[1]));
      setAuth(
        res.access_token,
        {
          id: payload.sub || payload.id || '',
          email: data.email,
          role: payload.role?.toLowerCase() || 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          tenant_id: payload.tenant_id,
        },
        undefined
      );
      navigate('/admin/dashboard');
    } catch (err) {
      setServerError(resolveError(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute -top-60 -right-60 w-[600px] h-[600px] rounded-full blur-3xl opacity-10 transition-all duration-700 bg-primary" />
        <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full blur-3xl opacity-10 transition-all duration-700 bg-[#7c5800]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-elevated/50 border border-transparent hover:border-border-subtle transition-all z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Página Inicial
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8 flex flex-col items-center">
          <h1 className="text-2xl font-black text-text-primary tracking-tight mt-2">
            Mob<span className="text-primary">Go</span>
          </h1>
          <p className="text-text-secondary text-sm mt-1 font-medium font-mono">
            Plataforma de Mobilidade Urbana
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface/90 backdrop-blur-xl border border-border-subtle rounded-xl shadow-2xl shadow-black/40 p-8">
          <p className="text-center text-text-secondary text-sm mb-6">
            Aceda ao painel de gestão
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Server error */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2.5 p-3 rounded-md bg-danger-bg/10 border border-danger-bg/30 text-danger-text text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <InputField
              label="E-mail"
              id="login-email"
              type="email"
              placeholder="empresa@exemplo.ao"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              registration={register('email')}
              autoComplete="email"
            />

            {/* Password */}
            <InputField
              label="Senha"
              id="login-password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              registration={register('password')}
              autoComplete="current-password"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full py-3.5 rounded-md font-bold text-black text-sm transition-all duration-300 mt-2',
                'flex items-center justify-center gap-2',
                isSubmitting
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:scale-[1.02] active:scale-[0.98]',
                'bg-primary hover:bg-primary-hover shadow-[0_0_15px_rgba(253,185,19,0.1)] hover:shadow-[0_0_20px_rgba(253,185,19,0.3)]'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />A verificar...
                </>
              ) : (
                'Entrar'
              )}
            </button>

            <div className="text-center mt-4">
              <span className="text-sm text-text-secondary">
                Não tem uma conta?{' '}
              </span>
              <Link
                to="/register"
                className="text-sm font-bold text-primary hover:underline"
              >
                Criar Conta
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-text-secondary text-xs mt-6 font-mono">
          © {new Date().getFullYear()} MobGo Angola v1.0
        </p>
      </motion.div>
    </div>
  );
};

/* ── Utilitários ────────────────────────────────────────────────────────────── */

function resolveError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
    return data?.error || data?.detail || 'Erro ao iniciar sessão.';
  }
  return 'Erro inesperado. Tente novamente.';
}

/* ── Sub-componentes ─────────────────────────────────────────────────────────── */

const InputField: React.FC<{
  label: string;
  id: string;
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  error?: string;
  registration: ReturnType<ReturnType<typeof useForm>['register']>;
  autoComplete?: string;
}> = ({
  label,
  id,
  type,
  placeholder,
  icon,
  error,
  registration,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-bold uppercase tracking-widest text-text-secondary block font-mono"
      >
        {label}
      </label>
      <div className="relative group">
        <span
          className={cn(
            'absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200',
            error
              ? 'text-danger-text'
              : 'text-text-secondary group-focus-within:text-primary'
          )}
        >
          {icon}
        </span>
        <input
          {...registration}
          id={id}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            'w-full bg-input-bg border rounded-md py-3 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-secondary/50',
            'outline-none transition-all duration-200 font-mono',
            error
              ? 'border-[#ffb4ab] focus:border-[#ffb4ab]'
              : 'border-border-subtle focus:border-border-hover focus:bg-surface'
          )}
          aria-invalid={!!error}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none p-1"
            tabIndex={-1}
            title={showPassword ? 'Ocultar senha' : 'Ver senha'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p
          role="alert"
          className="text-danger-text text-[11px] font-semibold ml-1 font-mono"
        >
          {error}
        </p>
      )}
    </div>
  );
};
