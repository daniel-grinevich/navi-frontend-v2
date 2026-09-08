import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useSessionStore } from '@/stores/session'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '/menu',
      name: 'menu',
      component: () => import('../views/MenuView.vue'),
      props: true,
    },
    {
      path: '/menu-item-detail/:id/:cartId?',
      name: 'menuItemDetail',
      component: () => import('../views/MenuItemDetailView.vue'),
      props: true,
    },
    {
      path: '/find-navi',
      name: 'findNavi',
      component: () => import('../views/FindNaviView.vue'),
      props: true,
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue'),
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/CheckoutView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/order-confirmation/:orderId',
      name: 'orderConfirmation',
      component: () => import('../views/OrderConfirmationView.vue'),
      props: true,
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrdersView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: '', redirect: { name: 'adminOrders' } },
        {
          path: 'orders',
          name: 'adminOrders',
          component: () => import('../views/admin/AdminOrdersView.vue'),
        },
        {
          // Static segment must precede the :orderId route so "new" isn't captured.
          path: 'orders/new',
          name: 'adminCreateOrder',
          component: () => import('../views/admin/AdminCreateOrderView.vue'),
        },
        {
          path: 'orders/:orderId',
          name: 'adminOrderDetail',
          component: () => import('../views/admin/AdminOrderDetailView.vue'),
          props: true,
        },
        {
          path: 'notifications',
          name: 'adminNotifications',
          component: () => import('../views/admin/AdminNotificationsView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth || to.meta.requiresAdmin) {
    const session = useSessionStore()

    if (!session.isInitialized) {
      await session.initAuth()
    }

    if (!session.isAuthenticated && !session.isGuest) {
      return { name: 'cart', query: { reason: 'auth-required' } }
    }

    if (to.meta.requiresAdmin && !session.isAdmin) {
      return { name: 'home' }
    }
  }
})

export default router
