import React from 'react'

// Base skeleton component
export const Skeleton = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={`animate-pulse bg-zinc-200 rounded ${className}`} 
      {...props}
    />
  )
}

// Price card skeleton
export const PriceCardSkeleton = () => (
  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
  </div>
)

// Balance card skeleton
export const BalanceCardSkeleton = () => (
  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6">
    <div className="flex items-center gap-2 mb-4">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-5 w-32" />
    </div>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <div className="text-right space-y-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="border-t pt-3 mt-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
    </div>
  </div>
)

// Transaction item skeleton
export const TransactionSkeleton = () => (
  <div className="bg-white border border-zinc-200 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
)

// Transaction list skeleton
export const TransactionListSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <TransactionSkeleton key={i} />
    ))}
  </div>
)

// Trading button skeleton
export const TradingButtonSkeleton = () => (
  <div className="flex gap-4">
    <Skeleton className="h-12 w-full rounded-lg" />
    <Skeleton className="h-12 w-full rounded-lg" />
  </div>
)

// Admin user row skeleton
export const AdminUserRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="ml-4 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <Skeleton className="h-4 w-16" />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <Skeleton className="h-4 w-20" />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <Skeleton className="h-4 w-24" />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <Skeleton className="h-4 w-20" />
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right">
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </td>
  </tr>
)

// Modal loading skeleton
export const ModalLoadingSkeleton = () => (
  <div className="flex items-center justify-center p-6">
    <div className="flex items-center gap-3">
      <div className="animate-spin h-6 w-6 border-2 border-zinc-300 border-t-blue-600 rounded-full"></div>
      <span className="text-zinc-600">Processing...</span>
    </div>
  </div>
)
