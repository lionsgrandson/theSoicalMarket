import React from 'react'
import SubscriptionRedirectWrapper from '../../components/SubscriptionRedirectWrapper'
import InfluencerSubscriptionRequired from './InfluencerSubscriptionRequired'

const page = () => {
  return (
    <SubscriptionRedirectWrapper>
      <InfluencerSubscriptionRequired/>
    </SubscriptionRedirectWrapper>
  )
}

export default page
