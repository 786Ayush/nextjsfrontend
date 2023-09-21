// 'use client'
import { useWeb3Contract } from "react-moralis"
import { abi,contractAddress } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect,useState } from "react"
import {ethers} from "ethers"
import { useNotification } from "web3uikit"
export default function LotteryEntrance() {

    const {chainId: chainIdHex,isWeb3Enabled,Moralis}= useMoralis()
    const chainId=parseInt(chainIdHex);
    const raffleAddress= chainId in contractAddress? contractAddress[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [Numofplayer,setNumofplayer] = useState("0")
    const [recentwinner,setrecentwinner]= useState("0")

    const dispatch= useNotification()

    const {
        runContractFunction: enterRaffle, 
        data: enterTxResponse,
        isLoading, 
        isFetching,
        } =useWeb3Contract({
        abi:abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params:{},
        msgValue:entranceFee,
    })

    const {runContractFunction: getentranceFee} =useWeb3Contract({
        abi:abi,
        contractAddress: raffleAddress,
        functionName: "getentranceFee",
        params:{},
    })
    
    const {runContractFunction: getNumberOfPlayers} =useWeb3Contract({
        abi:abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params:{},
    })

    const {runContractFunction: getRecentWinner} =useWeb3Contract({
        abi:abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params:{},
    })
    
    

    async function updateUI(){
        const entranceFeeFromCall= (await getentranceFee()).toString()
        const numPlayersFromCall= (await getNumberOfPlayers()).toString()
        const recentWinnerFromCall= (await getRecentWinner())
        setEntranceFee(entranceFeeFromCall)
        setNumofplayer(numPlayersFromCall)
        setrecentwinner(recentWinnerFromCall)
    }
    useEffect(()=>{
        if(isWeb3Enabled){
            updateUI() 
    }
    },[isWeb3Enabled])    
    useEffect(()=>{
        updateUI()
    },[recentwinner])
    const handleSuccess= async function (tx) {
        try{
            await tx.wait(1)
            handleNewNotification(tx)
            updateUI()
        } catch(err)
        {
            console.log(err);
        }
    }

    const handleNewNotification = function(){
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            Hi from Lottery Entrance.
             {raffleAddress?
             <div>
                <button 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                    onClick={
                    async function(){
                        await enterRaffle({
                            onSuccess:handleSuccess,
                            onError:(error)=>console.log(error)
                            
                        })}}
                        disabled={isFetching || isLoading}
                        >
                            {(isFetching||isLoading)?(
                                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>):
                                <div>Enter Raffle</div>
                            }
                            </button>
                    <div>Entrance Fee: {ethers.utils.formatEther(entranceFee,"ether")} ETH</div>        
                    <div>Players: {Numofplayer}</div>
                    <div>Recent Winner: {recentwinner}</div>
                
             </div>
             :
             <div>No Raffle Address is found</div>
             }
            
        </div>
    )
}