import Boton from '../../../componentes/Boton'
import Modal from '../../../componentes/Modal'

export interface PropsModalPublicarEvento {
  abierto: boolean
  eventCode: string
  nombreEvento: string
  cargando: boolean
  onCerrar: () => void
  onConfirmar: () => void
}

export default function ModalPublicarEvento({
  abierto,
  eventCode,
  nombreEvento,
  cargando,
  onCerrar,
  onConfirmar,
}: PropsModalPublicarEvento) {
  return (
    <Modal abierto={abierto} titulo="Publicar evento" onCerrar={onCerrar}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          ¿Confirmas la publicación del evento{' '}
          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
            {eventCode}
          </span>{' '}
          ({nombreEvento})? Una vez publicado será visible en la cartelera pública.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Boton variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton
            variante="primario"
            cargando={cargando}
            onClick={onConfirmar}
          >
            Confirmar publicación
          </Boton>
        </div>
      </div>
    </Modal>
  )
}
