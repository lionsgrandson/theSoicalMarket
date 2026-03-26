import React from 'react'
import SubscriptionRedirectWrapper from '../../components/SubscriptionRedirectWrapper'
import SubscriptionError from './SubscriptionError'

const page = () => {
  return (
    <SubscriptionRedirectWrapper>
      <SubscriptionError/>
    </SubscriptionRedirectWrapper>
  )
}

export default page
