"use client"
// import ManualHeader from '../../components/manualHeader'
import { MoralisProvider } from 'react-moralis'
import Header from '../../components/Header'
import LotteryEntrance from '../../components/LotteryEntrance'
import { NotificationProvider } from 'web3uikit'
// import LotteryEntrance from '../../components/p'
export default function Home() {
  return (
    <MoralisProvider initializeOnMount={false}>
      {/* <ManualHeader /> */}
      <NotificationProvider>

      <Header />
      {/* <LotteryEntrance /> */}
      <LotteryEntrance />
      </NotificationProvider>
    </MoralisProvider>
    
  )
}
