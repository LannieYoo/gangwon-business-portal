/**
 * Router Configuration
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '@shared/hooks';
import { Button } from '@shared/components';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}

// Public Route Component (redirect if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = user?.role === 'admin' ? '/admin' : '/member';
    return <Navigate to={redirectPath} replace />;
  }
  
  return children;
}

// Simple Error Page Components (inline, no separate pages directory)
function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="text-6xl font-bold text-primary-600 mb-4">403</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
        <p className="text-gray-600 mb-8">
          이 페이지에 접근할 수 있는 권한이 없습니다.
        </p>
        <Button onClick={() => window.location.href = '/'}>홈으로 돌아가기</Button>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md w-full mx-auto text-center">
        <div className="text-6xl font-bold text-primary-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">페이지를 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Button onClick={() => window.location.href = '/'}>홈으로 돌아가기</Button>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/member" replace />
  },
  {
    path: '/login',
    lazy: () => import('@member/modules/auth/Login').then(m => ({ Component: m.default }))
  },
  {
    path: '/register',
    lazy: () => import('@member/modules/auth/Register').then(m => ({ Component: m.default }))
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />
  },
  {
    path: '/404',
    element: <NotFound />
  },
  // Member routes will be added here
  {
    path: '/member/*',
    lazy: () => import('@member/routes').then(m => ({ 
      Component: () => (
        <ProtectedRoute allowedRoles={['member']}>
          <m.default />
        </ProtectedRoute>
      )
    }))
  },
  // Admin routes will be added here
  {
    path: '/admin/*',
    lazy: () => import('@admin/routes').then(m => ({ 
      Component: () => (
        <ProtectedRoute allowedRoles={['admin']}>
          <m.default />
        </ProtectedRoute>
      )
    }))
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />
  }
]);

export { ProtectedRoute, PublicRoute };

