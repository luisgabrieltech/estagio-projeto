import { withAuth } from "next-auth/middleware"
import { NextResponse, type NextRequest } from "next/server"
import { routes, internalPaths } from "@/lib/config/routes"
import {
  RateLimiter,
  getRateLimitStore,
  getIdentifier,
  getConfigForRoute,
  addRateLimitHeaders,
} from "@/lib/core/rate-limit"
import { isCertificateVerificationPath } from "@/lib/core/rate-limit/rate-limit.config"
import { rateLimitExceededResponse } from "@/lib/api/rate-limit"

const API_CURRENT_VERSION = 'v1'
const API_VERSION_PATTERN = /^\/api\/v(\d+)\//
const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED !== 'false'

async function handleRateLimit(
  req: NextRequest,
  pathname: string,
  userId?: string
): Promise<NextResponse | null> {
  if (!RATE_LIMIT_ENABLED) {
    return null
  }

  if (!pathname.startsWith('/api/')) {
    return null
  }

  if (pathname.startsWith('/api/auth/') || isCertificateVerificationPath(pathname)) {
    return null
  }

  try {
    const store = getRateLimitStore()
    const config = getConfigForRoute(pathname)
    
    const effectiveConfig = userId
      ? { ...config, maxRequests: Math.max(config.maxRequests, 200) }
      : config

    const limiter = new RateLimiter(store, effectiveConfig)
    const identifier = getIdentifier(req, userId)
    const result = await limiter.check(identifier)

    if (!result.allowed) {
      return rateLimitExceededResponse(result)
    }

    // @ts-expect-error - Custom property for rate limit
    req.rateLimitResult = result
  } catch (error) {
    console.error('Rate limiting error:', error)
  }

  return null
}

function handleApiVersioning(pathname: string, req: Request): NextResponse | null {
  if (!pathname.startsWith('/api/') || pathname.startsWith('/api/auth/')) {
    return null
  }

  const versionMatch = pathname.match(API_VERSION_PATTERN)
  
  if (versionMatch) {
    const requestedVersion = versionMatch[1]
    
    if (requestedVersion === '1') {
      const newPathname = pathname.replace(/^\/api\/v1\//, '/api/')
      const url = new URL(req.url)
      url.pathname = newPathname
      
      const response = NextResponse.rewrite(url)
      response.headers.set('X-API-Version', 'v1')
      return response
    } else {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `API version v${requestedVersion} is not supported. Current version is ${API_CURRENT_VERSION}.`
          },
          timestamp: new Date().toISOString()
        }),
        { 
          status: 404, 
          headers: { 
            'Content-Type': 'application/json',
            'X-API-Version': API_CURRENT_VERSION
          } 
        }
      )
    }
  }

  const response = NextResponse.next()
  response.headers.set('X-API-Version', API_CURRENT_VERSION)
  return response
}

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    const rateLimitResponse = await handleRateLimit(req, pathname, token?.sub)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const apiVersionResponse = handleApiVersioning(pathname, req)
    if (apiVersionResponse && apiVersionResponse.status !== 200) {
      return apiVersionResponse
    }

    if (apiVersionResponse && pathname.startsWith(internalPaths.api + '/')) {
      // @ts-expect-error - Custom property for rate limit
      const rateLimitResult = req.rateLimitResult
      if (rateLimitResult) {
        return addRateLimitHeaders(apiVersionResponse, rateLimitResult)
      }
      return apiVersionResponse
    }

    const isAdminRoute = pathname.startsWith(internalPaths.dashboardAdmin)
    
    if (!isAdminRoute) {
      return NextResponse.next()
    }

    if (token?.role === "ADMIN") {
      return NextResponse.next()
    }

    if (token?.role === "CSA") {
      const isFormRoute = pathname.startsWith(internalPaths.dashboardAdminForms)
      
      if (isFormRoute) {
        return NextResponse.next()
      }
      
      return NextResponse.redirect(new URL(routes.dashboard.home, req.url))
    }

    return NextResponse.redirect(new URL(routes.dashboard.home, req.url))
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        
        if (req.method === 'GET' && isCertificateVerificationPath(pathname)) {
          return true
        }

        if (pathname === internalPaths.home) {
          return true
        }
        
        const publicAuthRoutes: string[] = [
          internalPaths.login,
          internalPaths.register,
          internalPaths.forgotPassword,
          internalPaths.magicLogin,
          internalPaths.magicAuth,
          internalPaths.accountInactive,
        ]
        
        if (pathname.startsWith(internalPaths.resetPassword + '/')) {
          return true
        }
        
        if (publicAuthRoutes.includes(pathname)) {
          return true
        }
        
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/((?!auth/).*)', 
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password/:path*',
    '/magic-login',
    '/magic-auth',
    '/conta-inativada',
  ]
}
