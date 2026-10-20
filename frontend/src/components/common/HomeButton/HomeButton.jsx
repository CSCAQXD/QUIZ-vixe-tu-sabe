import { useNavigate } from 'react-router-dom'
import Button from '../Button/Button'

function HomeButton({ className = '' }) {
  const navigate = useNavigate()

  return (
    <Button className={className} onClick={() => navigate('/')} variant="secondary">
      Tela inicial
    </Button>
  )
}

export default HomeButton
