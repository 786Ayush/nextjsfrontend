// 'use client'
import { useWeb3Contract } from "react-moralis"
import { abi,contractAddress,VRFCoordinatorV2Mock_address,VRFCoordinatorV2Mock_abi } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect,useState } from "react"
import {ethers} from "ethers"
import { useNotification } from "web3uikit"
export default function LotteryEntrance() {

    const {chainId: chainIdHex,isWeb3Enabled}= useMoralis()
    const chainId=parseInt(chainIdHex);
    const raffleAddress= chainId in contractAddress? contractAddress[chainId][0] : null
    const VRFCoordinatorV2Mock_add= chainId in VRFCoordinatorV2Mock_address? VRFCoordinatorV2Mock_address[chainId][0]:null
    const [entranceFee, setEntranceFee] = useState("0")
    const [Numofplayer,setNumofplayer] = useState("0")
    const [recentwinner,setrecentwinner]= useState("0")

    const dispatch= useNotification()

    const {runContractFunction: fulfillRandomWords}= useWeb3Contract({
        abi:VRFCoordinatorV2Mock_abi,
        contractAddress: VRFCoordinatorV2Mock_add,
        functionName: "fulfillRandomWords",
        params:{},
    })

    const {runContractFunction: enterRaffle,isFetching,isLoading} =useWeb3Contract({
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
    
    const {runContractFunction: checkUpkeep}= useWeb3Contract({
        abi:abi,
        contractAddress: raffleAddress,
        functionName:"checkUpkeep",
        params:{}
    })
    const {runContractFunction: performUpkeep}= useWeb3Contract({
        abi:abi,
        contractAddress: raffleAddress,
        functionName:"performUpkeep",
        params:{}
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
            // console.log(`ksdfljl`)
        updateUI() 
    }
    },[isWeb3Enabled])    

    const handleSuccess= async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
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

    const handlewinner=async function(){
        const { upkeepNeeded }=await checkUpkeep()
        if(upkeepNeeded) {
            const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
            const tx = await performUpkeep(checkData)
            const txReceipt= await tx.wait(1)
            const requestId= txReceipt.events[1].args.requestId
            console.log(`Performed upkeep with Requested: ${requestId}`)
            await fulfillRandomWords(requestId,raffleAddress)
            const recentwinner= await getRecentWinner()
            console.log(`the Winner is ${recentwinner}`)
            updateUI()

        // }else{
        //     console.log("No upkeep needed!")
        }
    }
    return (
        <div className="c">
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
                            {(isFetching||isLoading)?
                                (<div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>):
                                <div>Enter Raffle</div>
                            }
                            </button>
                    <div>Entrance Fee: {ethers.utils.formatEther(entranceFee,"ether")} ETH</div>        
                    <div>Players: {Numofplayer}</div>
                    <div>Recent Winner: {recentwinner}</div>
                <button onClick={
                    handlewinner()
                }>Winner</button>
             </div>
             :
             
             <div>No Raffle Address is found</div>
             }
            
        </div>
    )
    }
