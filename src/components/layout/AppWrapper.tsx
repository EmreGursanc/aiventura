'use client'

import React from 'react'
import ClientWrapper from '@/components/layout/ClientWrapper'

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  return <ClientWrapper>{children}</ClientWrapper>
}
