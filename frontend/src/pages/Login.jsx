import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Login(){
	const navigate = useNavigate()
	const [email,setEmail] = useState('')
	const [password,setPassword] = useState('')
	const [loading,setLoading] = useState(false)
	const [error,setError] = useState('')

	const onSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setLoading(true)
		try{
			await axios.post('/user/login',{ email,password },{ withCredentials:true })
			navigate('/')
		}catch(err){
			setError(err?.response?.data?.message || 'Login failed')
		}finally{ setLoading(false) }
	}

	return (
		<div style={{maxWidth:420,margin:'40px auto',padding:20}}>
			<h2>Login</h2>
			<form onSubmit={onSubmit}>
				<input placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block',width:'100%',marginBottom:10,padding:8}}/>
				<input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block',width:'100%',marginBottom:10,padding:8}}/>
				<button disabled={loading} type="submit">{loading?'Logging in...':'Login'}</button>
			</form>
			{error && <p style={{color:'red'}}>{error}</p>}
			<p>New here? <Link to="/register">Register</Link></p>
		</div>
	)
}
