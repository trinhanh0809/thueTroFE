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
import RoomTypeManager from '@/manager/admin/RoomTypeManager'
import HostRequestManager from '@/manager/admin/HostRequestManager'
import AmenityManager from '@/manager/admin/AmenityManager'
import RoomManger from '@/manager/host/HostRoomManager'
import AdminRoomFormPage from '@/manager/admin/AdminRoomManager/form'
import HostRoomFormPage from '@/manager/host/HostRoomManager/form'
import RoomManager from '@/manager/admin/AdminRoomManager'
import HomePage from '@/pages/home/HomePage'
import RoomCard from '@/pages/components/RoomCard/RoomCard'
import RoomDetail from '@/pages/home/RoomDetail'
import RoomList from '@/pages/home/rooms/RoomList'
import RowManagement from '@/manager/host/RowManager'
import ContractManagement from '@/manager/host/ContactManager'
import BlocksManagement from '@/manager/host/BlockManager'
import RoomListPage from '@/pages/home/rooms/RoomListPull'

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
    key: 'admin-browse',
    label: 'Danh sách tiện ích',
    to: '/admin/danh-sach-tien-ich',
  },
  {
    key: 'admin-room',
    label: 'Danh sách phòng trọ',
    to: '/admin/danh-sach-phong-tro',
  },
]

const hostNavItems = [
  { key: 'host-rooms', label: 'Danh sách phòng trọ', to: '/host/phong-tro' },
  {
    key: 'manager-rooms',
    label: 'Quản lý phòng trọ',
    to: '/host/quan-ly-phong-tro',
  },
  {
    key: 'contact-rooms',
    label: 'Quản lý hợp đồng',
    to: '/host/quan-ly-hop-dong',
  },
  {
    key: 'invoice-rooms',
    label: 'Quản lý hoá đơn',
    to: '/host/quan-ly-hoa-don',
  },
  {
    key: 'guest-rooms',
    label: 'Quản lý khách thuê',
    to: '/host/quan-ly-khach-thue',
  },
]

const routeConfig = [
  // { path: '/', element: <div>Home</div>, layout: DefaultLayout },
  { path: '/', element: <HomePage />, layout: DefaultLayout },
  { path: '/card', element: <RoomCard />, layout: DefaultLayout },
  { path: '/login', element: <AuthPage />, layout: EmptyLayout },
  { path: '/rooms/:id', element: <RoomDetail />, layout: DefaultLayout },
  { path: '/rooms', element: <RoomListPage />, layout: DefaultLayout },
  {
    path: '/rooms/:idRoomType',
    element: <RoomList />,
    layout: DefaultLayout,
  },

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
      { path: 'quan-ly-tai-khoan-can-duyet', element: <HostRequestManager /> },
      { path: 'quan-ly-loai-phong', element: <RoomTypeManager /> },
      { path: 'danh-sach-tien-ich', element: <AmenityManager /> },

      // Trang dạng detail
      { path: 'danh-sach-phong-tro', element: <RoomManager /> },
      {
        path: 'danh-sach-phong-tro/:id',
        element: <AdminRoomFormPage mode="detail" />,
      },
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
      // { path: 'phong-tro', element: <RoomManger /> },
      { path: 'phong-tro', element: <BlocksManagement /> },
      { path: 'quan-ly-phong-tro', element: <RowManagement /> },
      { path: 'quan-ly-hop-dong', element: <ContractManagement /> },
      { path: 'quan-ly-hoa-don', element: <RoomManger /> },
      { path: 'quan-ly-khach-thue', element: <RoomManger /> },
      {
        path: 'danh-sach-phong-tro/tao-moi',
        element: <HostRoomFormPage mode="create" />,
      },
      {
        path: 'danh-sach-phong-tro/:id',
        element: <AdminRoomFormPage mode="detail" />,
      },
      {
        path: 'danh-sach-phong-tro/:id/sua',
        element: <HostRoomFormPage mode="edit" />,
      },
    ],
  },

  // Error & Not found
  { path: '/forbidden403', element: <Forbidden403 />, layout: DefaultLayout },
  { path: '*', element: <div>Not Found</div>, layout: DefaultLayout },
]

export default routeConfig
