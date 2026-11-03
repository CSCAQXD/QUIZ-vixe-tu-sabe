import { Component } from 'react'

import Button from '../Button/Button'
import PageStatus from '../PageStatus/PageStatus'

class AppErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <PageStatus
          action={<Button onClick={() => window.location.reload()}>Recarregar página</Button>}
          eyebrow="Não conseguimos abrir esta tela"
          fullScreen
          message="Recarregue a página para tentar novamente. Se o problema continuar, peça ajuda à equipe responsável pelo quiz."
          title="Eita! Algo inesperado aconteceu."
          type="error"
        />
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary
