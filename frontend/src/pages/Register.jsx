import { useState } from 'react'
import api from '../shared/apiClient'
import { useNavigate, Link } from 'react-router-dom'

export default function Register(){
	const navigate = useNavigate()
	const [form,setForm] = useState({name:'',email:'',contact:'',password:''})
	const [loading,setLoading] = useState(false)
	const [error,setError] = useState('')

	const onChange = (e) => setForm({...form,[e.target.name]:e.target.value})
	const onSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setLoading(true)
		try{
			await api.post('https://library-1-xu20.onrender.com/user/register',form)
			navigate('/login')
		}catch(err){
			setError(err?.response?.data?.message || 'Registration failed')
		}finally{ setLoading(false) }
	}

	return (
		<div style={{maxWidth:480,margin:'40px auto',padding:20}}>
			<h2>Register</h2>
			<form onSubmit={onSubmit}>
				<input name="name" placeholder="Full name" value={form.name} onChange={onChange} style={{display:'block',width:'100%',marginBottom:10,padding:8}}/>
				<input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} style={{display:'block',width:'100%',marginBottom:10,padding:8}}/>
				<input name="contact" placeholder="Contact" value={form.contact} onChange={onChange} style={{display:'block',width:'100%',marginBottom:10,padding:8}}/>
				<input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} style={{display:'block',width:'100%',marginBottom:10,padding:8}}/>
				<button disabled={loading} type="submit">{loading?'Creating...':'Create account'}</button>
			</form>
			{error && <p style={{color:'red'}}>{error}</p>}
			<p>Already have an account? <Link to="/login">Login</Link></p>
		</div>
	)
}
