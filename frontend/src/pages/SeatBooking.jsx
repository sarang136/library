import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { addMinutes, differenceInSeconds } from 'date-fns'
import { useNavigate, Link } from 'react-router-dom'

axios.defaults.baseURL = 'http://localhost:3000'
axios.defaults.withCredentials = true

const TOTAL_SEATS = 100

function Seat({ number, status, onClick, remaining }){
	const color = status==='booked' ? '#28a745' : '#ccc'
	return (
		<button onClick={onClick} style={{
			width:48,height:48,margin:6,borderRadius:8,border:'1px solid #999',
			backgroundColor: color, color:'#000', position:'relative'
		}}>
			{number}
			{status==='booked' && remaining>0 && (
				<span style={{position:'absolute',right:2,bottom:2,fontSize:10,color:'#fff'}}>{Math.max(0,Math.floor(remaining/60))}:{String(remaining%60).padStart(2,'0')}</span>
			)}
		</button>
	)
}

export default function SeatBooking(){
	const navigate = useNavigate()
	const [start,setStart] = useState(new Date())
	const [end,setEnd] = useState(addMinutes(new Date(), 120))
	const [loading,setLoading] = useState(false)
	const [statuses,setStatuses] = useState({})
	const [amount] = useState(0)
	const [tick, setTick] = useState(0)

	useEffect(()=>{
		const id = setInterval(()=> setTick((t)=>t+1), 1000)
		return ()=> clearInterval(id)
	},[])

	const refresh = async ()=>{
		setLoading(true)
		try{
			const { data } = await axios.get('/user/seats/status',{ params:{ startTime:start.toISOString(), endTime:end.toISOString() } })
			const map = {}
			for(const b of data.bookings){
				map[b.seatNo] = { status:'booked', endTime:b.endTime }
			}
			setStatuses(map)
		}catch(e){
			if(e?.response?.status===400){/*ignore*/} else { console.error(e) }
		}finally{ setLoading(false) }
	}

	useEffect(()=>{ refresh() },[start,end])

	const seats = useMemo(()=> Array.from({length:TOTAL_SEATS},(_,i)=>i+1),[])

	const handleBook = async (seatNo)=>{
		if(statuses[seatNo]?.status==='booked') return
		setLoading(true)
		try{
			const me = await axios.get('/user/bookings/active').catch(()=> null)
			// require login
			if(!me){ navigate('/login'); return }
			const userId = me?.data?.bookings?.[0]?.userId || 'self'
			await axios.post(`/user/book-seats/${userId}`,{ startTime:start, endTime:end, seatNo, amount },{ withCredentials:true })
			await refresh()
		}catch(e){
			if(e?.response?.status===400){ navigate('/login') }
		}finally{ setLoading(false) }
	}

	return (
		<div style={{padding:20}}>
			<div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
				<h2>Seat Booking</h2>
				<div>
					<Link to="/profile">Profile</Link>
				</div>
			</div>
			<div style={{display:'flex',gap:16,alignItems:'center',marginBottom:16}}>
				<div>
					<label>Start</label>
					<DatePicker
						selected={start}
						showTimeSelect
						onChange={setStart}
						dateFormat="Pp"
					/>
				</div>
				<div>
					<label>End</label>
					<DatePicker
						selected={end}
						showTimeSelect
						onChange={setEnd}
						dateFormat="Pp"
					/>
				</div>
				<button onClick={refresh} disabled={loading}>Refresh</button>
			</div>
			<div style={{display:'grid',gridTemplateColumns:'repeat(10, 60px)'}}>
				{seats.map((n)=>{
					const info = statuses[n]
					const remaining = info?.endTime ? Math.max(0, differenceInSeconds(new Date(info.endTime), new Date())) : 0
					return (
						<Seat key={n} number={n} status={info? 'booked':'available'} remaining={remaining} onClick={()=>handleBook(n)} />
					)
				})}
			</div>
		</div>
	)
}
