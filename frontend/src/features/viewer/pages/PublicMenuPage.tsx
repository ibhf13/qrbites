import React from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { FlexBox } from '@/components/common'
import { MenuLoading, MenuError, MenuImage, MenuFooter } from '../components'
import { usePublicMenu } from '../hooks'
import { ViewerProvider } from '../contexts'

const PublicMenuPage: React.FC = () => {
  const { menuId } = useParams<{ menuId: string }>()
  const [searchParams] = useSearchParams()
  const restaurantId = searchParams.get('restaurant')

  const { data: menuData, isLoading, error, refetch } = usePublicMenu({
    menuId,
    restaurantId: restaurantId || undefined
  })

  if (isLoading) {
    return <MenuLoading />
  }

  if (error || !menuData) {
    return <MenuError onRetry={() => refetch()} error={error as Error} />
  }

  return (
    <ViewerProvider>
      <FlexBox direction='col' justify='between' className='h-screen'>
        <MenuImage menuData={menuData} />
        <MenuFooter menuData={menuData} />
      </FlexBox>
    </ViewerProvider>
  )
}

export default PublicMenuPage