import './App.css'
import React from 'react'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'


//importing pages
import Home from './pages/home'
import Authentication from './pages/Auth'
import Desktop from './pages/Desktop'



function App() {


  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        //Authentication Routes
        <Route path='/signIn' element={<Authentication method="sign_in"/>} />
        <Route path='/signUp' element={<Authentication method="sign_up"/>} />
        //desktop router
        <Route path='/Desktop' element={<Desktop />} />
      </Routes>
    </Router>

    
  )
}

export default App
