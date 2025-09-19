import { useEffect, useMemo, useState } from 'react'
import api from '../shared/apiClient'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { addMinutes, differenceInSeconds } from 'date-fns'
import { useNavigate, Link } from 'react-router-dom'

const TOTAL_SEATS = 100

function Seat({ number, status, onClick, remaining }) {
	const color = status === 'booked' ? '#28a745' : (status === 'selected' ? '#007bff' : '#ccc')
	return (
		<button onClick={onClick} style={{
			width: 48, height: 48, margin: 6, borderRadius: 8, border: '1px solid #999',
			backgroundColor: color, color: '#000', position: 'relative'
		}}>
			{number}
			{status === 'booked' && remaining > 0 && (
				<span style={{ position: 'absolute', right: 2, bottom: 2, fontSize: 10, color: '#fff' }}>{Math.max(0, Math.floor(remaining / 60))}:{String(remaining % 60).padStart(2, '0')}</span>
			)}
		</button>
	)
}

export default function SeatBooking() {
	const navigate = useNavigate()
	const [start, setStart] = useState(new Date())
	const [end, setEnd] = useState(addMinutes(new Date(), 120))
	const [loading, setLoading] = useState(false)
	const [statuses, setStatuses] = useState({})
	const [amount, setAmount] = useState('')
	const [tick, setTick] = useState(0)
	const [selectedSeat, setSelectedSeat] = useState(null)
	const [error, setError] = useState('')

	useEffect(() => {
		const id = setInterval(() => setTick((t) => t + 1), 1000)
		return () => clearInterval(id)
	}, [])

	const refresh = async () => {
		setLoading(true)
		try {
			const { data } = await api.get('https://library-1-xu20.onrender.com/user/seats/status', { params: { startTime: start.toISOString(), endTime: end.toISOString() } })
			const map = {}
			for (const b of data.bookings) {
				map[b.seatNo] = { status: 'booked', endTime: b.endTime }
			}
			setStatuses(map)
		} catch (e) {
			if (e?.response?.status === 400) { /*ignore*/ } else { console.error(e) }
		} finally { setLoading(false) }
	}

	useEffect(() => { refresh() }, [start, end])

	const seats = useMemo(() => Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1), [])

	const handleSelect = (seatNo) => {
		if (statuses[seatNo]?.status === 'booked') return
		setSelectedSeat(seatNo)
	}

	const handleBook = async () => {
		setError('')
		if (!selectedSeat || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
			setError('All fields are required')
			return
		}
		setLoading(true)
		try {
			const userId = localStorage.getItem('userId')
			if (!userId) { navigate('/login'); return }
			await api.post(`https://library-1-xu20.onrender.com/user/book-seats/${userId}`, {
				startTime: start,
				endTime: end,
				seatNo: selectedSeat,
				amount: Number(amount),
				userId
			})
			setSelectedSeat(null)
			setAmount('')
			await refresh()
		} catch (e) {
			if (e?.response?.status === 400) {
				setError('All fields are required')
			} else {
				setError('Booking failed')
			}
			if (e?.response?.status === 400) { navigate('/login') }
		} finally { setLoading(false) }
	}

	return (
		<div style={{ padding: 20 }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<h2>Seat Booking</h2>
				<div>
					<Link to="/profile">Profile</Link>
				</div>
			</div>
			<div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
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
				<div>
					<label>Amount</label>
					<input
						type="number"
						min="1"
						placeholder="Enter amount"
						value={amount}
						onChange={e => setAmount(e.target.value)}
						style={{ width: 100, padding: 6, marginLeft: 4 }}
						disabled={loading}
					/>
				</div>
				<button onClick={refresh} disabled={loading}>Refresh</button>
				<button
					onClick={handleBook}
					disabled={!selectedSeat || loading}
					style={{ marginLeft: 8, padding: '8px 12px' }}
				>
					Book Seat {selectedSeat ? `#${selectedSeat}` : ''}
				</button>
			</div>
			{error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 60px)' }}>
				{seats.map((n) => {
					const info = statuses[n]
					const remaining = info?.endTime ? Math.max(0, differenceInSeconds(new Date(info.endTime), new Date())) : 0
					return (
						<Seat key={n} number={n} status={selectedSeat === n ? 'selected' : (info ? 'booked' : 'available')} remaining={remaining} onClick={() => handleSelect(n)} />
					)
				})}
			</div>
		</div>
	)
}
