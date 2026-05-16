import { useEffect } from 'react'
import { socket } from '../../sockets/socketManager'

const Home = () => {
  useEffect(() => {
    // TODO Sprint 1: reemplazar con userId real de Firebase Auth
    socket.emit('newUser', 'temp-user-' + Date.now())
  }, [])

  return <div>Home</div>
}

export default Home
