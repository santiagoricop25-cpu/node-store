import { useEffect } from 'react'
import './App.css'

function App() {
  const year = new Date().getFullYear()

  return (
    <div className="page">
      <header>
        <div className="brand">tienda.ricops.com</div>
        <div className="status"><span className="dot"></span> en construcción</div>
      </header>

      <main>
        <div className="hero">
          <div className="eyebrow">// e-commerce</div>
          <h1>Muy pronto<span className="cursor"></span></h1>
          <p className="lead">
            Estamos construyendo esta tienda desde cero, a la medida — catálogo,
            carrito, pagos y todo lo necesario para una experiencia de compra
            profesional. Corriendo en mi propio servidor, desplegada con Coolify.
          </p>

          <div className="progress">
            <div className="row"><span>Infraestructura del servidor</span><span className="tag done">Listo</span></div>
            <div className="row"><span>Dominio y HTTPS</span><span className="tag done">Listo</span></div>
            <div className="row"><span>Panel de despliegue</span><span className="tag done">Listo</span></div>
            <div className="row"><span>Diseño y catálogo</span><span className="tag wip">En progreso</span></div>
            <div className="row"><span>Carrito y pagos</span><span className="tag next">Próximo</span></div>
          </div>
        </div>
      </main>

      <footer>
        <span>&copy; {year} ricops.com</span>
        <span>proxmox + coolify + cloudflare</span>
      </footer>
    </div>
  )
}

export default App
