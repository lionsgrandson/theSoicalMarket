import React from 'react'
import SubscriptionRedirectWrapper from '../../components/SubscriptionRedirectWrapper'
import BrandSubscriptionRequired from './BrandSubscriptionRequired'

const page = () => {
  return (
    <SubscriptionRedirectWrapper>
      <BrandSubscriptionRequired/>
      </SubscriptionRedirectWrapper>
  )
}

export default page
