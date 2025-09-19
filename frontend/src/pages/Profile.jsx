import { useEffect, useState } from 'react'
import axios from 'axios'
import { differenceInSeconds } from 'date-fns'

export default function Profile(){
	const [bookings,setBookings] = useState([])
	const [tick,setTick] = useState(0)

	useEffect(()=>{
		const id = setInterval(()=> setTick(t=>t+1),1000)
		return ()=> clearInterval(id)
	},[])

	const load = async ()=>{
		try{
			const { data } = await axios.get('/user/bookings/active', { withCredentials:true })
			setBookings(data.bookings || [])
		}catch(e){
			setBookings([])
		}
	}

	useEffect(()=>{ load() },[])

	return (
		<div style={{padding:20}}>
			<h2>My Active Bookings</h2>
			{bookings.length===0 && <p>No active bookings.</p>}
			<ul>
				{bookings.map(b=>{
					const remain = Math.max(0, differenceInSeconds(new Date(b.endTime), new Date()))
					return (
						<li key={b._id} style={{marginBottom:12}}>
							Seat #{b.seatNo} | {new Date(b.startTime).toLocaleString()} → {new Date(b.endTime).toLocaleString()} | Remaining: {Math.floor(remain/60)}:{String(remain%60).padStart(2,'0')}
						</li>
					)
				})}
			</ul>
		</div>
	)
}
