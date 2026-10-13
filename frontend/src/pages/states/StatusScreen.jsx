import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Notice from '../../components/Notice'
import Skeleton from '../../components/Skeleton'
import StatusCard from '../../components/StatusCard'
import statusScreens from './statusScreens'

// Renders one of the result screens listed in statusScreens.js.

function StatusScreen({ name }) {
  const navigate = useNavigate()
  const screen = statusScreens[name]

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <StatusCard title={screen.title} description={screen.description}>
        {screen.kind === 'success' && (
          <Notice type="success" title="Success" body="Your action completed successfully." />
        )}

        {screen.kind === 'error' && (
          <Notice type="error" title="Action needed" body={screen.description} />
        )}

        {screen.kind === 'loading' && (
          <>
            <Skeleton />
            <Skeleton />
          </>
        )}

        <Button
          variant={screen.kind === 'loading' ? 'secondary' : 'primary'}
          className="w-full"
          onClick={() => navigate(screen.action.to)}
        >
          {screen.action.label}
        </Button>
      </StatusCard>
    </div>
  )
}

export default StatusScreen
