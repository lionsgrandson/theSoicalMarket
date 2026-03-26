'use client'
import type React from 'react'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'
import { signIn } from 'next-auth/react'

function LoginPageContent() {
  const router = useRouter()
  const params = useSearchParams()
  const returnTo = params.get('returnTo')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}

    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'

    setErrors(newErrors)
    if (Object.keys(newErrors).length) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setErrors({ general: result.error })
        throw new Error(result.error)
      }

      if (returnTo) {
        router.push(returnTo)
      } else {
        router.push('/home_dashboard')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed'
      setErrors({ general: message })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    signIn('google', {
      callbackUrl: `/home_dashboard`,
    })
  }
  const handleAppleLogin = async () => {
    signIn('apple', {
      callbackUrl: `/home_dashboard`,
    })
  }

  return (
    <div className='min-h-screen bg-slate-50 flex'>
      {/* Left Side - Form */}
      <div className='w-full lg:w-1/2 bg-slate-800 flex flex-col'>
        {/* Header */}
        <div className='flex justify-between items-center p-6'>
          <Link href='/'>
            <div className=''>
              <Image
                src={'/images/logo.png'}
                width={200}
                height={55}
                alt='social market'
                className='w-auto h-auto'
              />
            </div>
          </Link>
        </div>

        {/* Form Content */}
        <div className='flex-1 flex items-center justify-center px-6'>
          <div className='w-full max-w-md'>
            <div className='text-center mb-8'>
              <h1 className='text-3xl font-bold text-white mb-2'>
                Welcome Back!
              </h1>
              <p className='text-slate-300'>Please log into your account</p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <input
                  type='email'
                  placeholder='Enter your email'
                  className='w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary'
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {errors.email && (
                  <p className='text-red-400 text-sm mt-1'>{errors.email}</p>
                )}
              </div>

              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  className='w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary pr-12'
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500'
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && (
                  <p className='text-red-400 text-sm mt-1'>{errors.password}</p>
                )}
              </div>

              <div className='flex items-center justify-between'>
                {/* <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData({ ...formData, rememberMe: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-white text-sm">Remember me</span>
                </label> */}
                <Link
                  href='/auth/forgot-password'
                  className='text-slate-300 text-sm hover:text-white'
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type='submit'
                disabled={loading}
                className='w-full cursor-pointer bg-secondary hover:bg-[var(--secondaryhover)] text-slate-800 font-semibold py-3 rounded-lg'
              >
                {loading ? 'Logging in...' : 'Log in'}
              </Button>
              {errors.general && (
                <p className='text-red-400 text-sm mt-1'>{errors.general}</p>
              )}

              <div className='text-center'>
                <span className='text-slate-400'>or</span>
              </div>

              <Button
                type='button'
                variant='outline'
                className='w-full cursor-pointer border-slate-600 text-white hover:bg-primary hover:text-white py-3 rounded-lg bg-transparent'
                onClick={handleGoogleLogin}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  className='h-5 w-5'
                >
                  {/* Colorful Google Icon using official brand colors */}
                  <path
                    d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                    fill='#4285F4'
                  ></path>
                  <path
                    d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                    fill='#34A853'
                  ></path>
                  <path
                    d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z'
                    fill='#FBBC05'
                  ></path>
                  <path
                    d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                    fill='#EA4335'
                  ></path>
                  <path d='M1 1h22v22H1z' fill='none'></path>
                </svg>
                Continue with Google
              </Button>

              <Button
                type='button'
                variant='outline'
                onClick={handleAppleLogin}
                className='w-full cursor-pointer border-slate-600 text-white hover:bg-primary hover:text-white py-3 rounded-lg bg-transparent'
              >
                <svg
                  className='w-5 h-5 mr-2'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
                </svg>
                Continue with Apple
              </Button>

              {/* <div className="text-center">
                <span className="text-slate-400">
                  Don&apos;t have an account?{" "}
                </span>
                <Link
                  href="/auth/signup"
                  className="text-secondary hover:text-yellow-400"
                >
                  Sign up
                </Link>
              </div> */}
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className='hidden relative lg:flex lg:w-1/2 bg-slate-100 items-center justify-center p-8'>
        <Button
          variant='outline'
          className='absolute top-4 right-4 bg-secondary text-slate-800 border-secondary hover:bg-[var(--secondaryhover)]'
          asChild
        >
          <Link href='/'>Back to website →</Link>
        </Button>
        <div className='max-w-md'>
          <Image
            height={600}
            width={600}
            src='/images/login-illustration.png'
            alt='Welcome illustration'
            className='w-full h-auto'
          />
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className='min-h-screen bg-slate-50' />}>
      <LoginPageContent />
    </Suspense>
  )
}
