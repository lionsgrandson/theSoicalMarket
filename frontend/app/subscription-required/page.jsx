import React from 'react'
import SubscriptionRedirectWrapper from '../../components/SubscriptionRedirectWrapper'
import SubscriptionRequired from './SubscriptionRequired'

const page = () => {
  return (
    <SubscriptionRedirectWrapper>
      <SubscriptionRequired/>
    </SubscriptionRedirectWrapper>
  )
}

export default page
