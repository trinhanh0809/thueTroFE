// src/routes/routeConfig.jsx
import React from 'react'
import { Outlet } from 'react-router-dom'

import AuthPage from '@/pages/auth/AuthPage'
import ProfilePage from '@/pages/auth/ProfilePage'
import EmptyLayout from '@/components/layout/EmptyLayout.jsx'
import DefaultLayout from '@/components/layout/DefaultLayout.jsx'
import Forbidden403 from '@/pages/error/Forbidden403'

import RoleGuard from './RoleGuard'
import AdminLayout from '@/manager/components/AdminLayout'
import UserManager from '@/manager/admin/UserManager'
import Dashboard from '@/manager/admin/Dashboard'
import HostPage from '@/manager/host/Host'
import RoomTypeManager from '@/manager/admin/RoomTypeManager'
import RoomManager from '@/manager/admin/RoomManager'

const adminNavItems = [
  { key: 'admin-home', label: 'Trang chủ', to: '/admin', end: true },
  {
    key: 'admin-users',
    label: 'Quản lý tài khoản',
    to: '/admin/quan-ly-tai-khoan',
  },

  {
    key: 'admin-userBrowse',
    label: 'Quản lý tài khoản cần duyệt',
    to: '/admin/quan-ly-tai-khoan-can-duyet',
  },

  {
    key: 'admin-roomType',
    label: 'Quản lý loại phòng',
    to: '/admin/quan-ly-loai-phong',
  },
  {
    key: 'admin-room',
    label: 'Danh sách phòng trọ',
    to: '/admin/danh-sach-phong-tro',
  },
  {
    key: 'admin-browse',
    label: 'Danh sách phòng trọ cần duyệt',
    to: '/admin/danh-sach-phong-tro-can-duyet',
  },
]

const hostNavItems = [
  // { key: 'host-home', label: 'Trang chủ', to: '/host', end: true },
  { key: 'host-rooms', label: 'Phòng trọ', to: '/host/phong-tro' },
]

const routeConfig = [
  { path: '/', element: <div>Home</div>, layout: DefaultLayout },
  { path: '/login', element: <AuthPage />, layout: EmptyLayout },

  // User
  { path: '/profile', element: <ProfilePage />, layout: DefaultLayout },
  //Admin
  {
    path: '/admin',
    element: (
      <RoleGuard
        roles={['ADMIN']}
        Layout={AdminLayout}
        items={adminNavItems}
        brand={{ name: 'Admin', to: '/admin' }}
      />
    ),
    layout: EmptyLayout,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'quan-ly-tai-khoan', element: <UserManager /> },
      { path: 'quan-ly-tai-khoan-can-duyet', element: <UserManager /> },
      { path: 'quan-ly-loai-phong', element: <RoomTypeManager /> },
      { path: 'danh-sach-phong-tro', element: <RoomManager /> },
      { path: 'danh-sach-phong-tro-can-duyet', element: <RoomManager /> },
    ],
  },
  //Host
  {
    path: '/host',
    element: (
      <RoleGuard roles={['HOST']} Layout={AdminLayout} items={hostNavItems} />
    ),
    layout: EmptyLayout,
    children: [
      // { index: true, element: <Dashboard /> },
      { path: 'phong-tro', element: <HostPage /> },
    ],
  },

  // Error & Not found
  { path: '/forbidden403', element: <Forbidden403 />, layout: DefaultLayout },
  { path: '*', element: <div>Not Found</div>, layout: DefaultLayout },
]

export default routeConfig
